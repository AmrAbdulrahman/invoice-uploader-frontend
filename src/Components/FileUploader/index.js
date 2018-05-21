import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import get from 'lodash/get';
import each from 'lodash/each';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import Dropzone from 'react-dropzone';
import Loading from '../Loading';

import styles from './styles';
import UploadsActions from '../../Redux/Uploads';
import Strings from '../../Services/Strings';

class FileUploader extends Component {
  get fileState() {
    const { uploads, identifier } = this.props;
    return get(uploads, identifier, {});
  }

  get file() {
    return this.fileState.file || {};
  }

  // notify parent component when a file gets uploaded
  componentDidUpdate(prevProps) {
    const { uploads } = prevProps;
    const prevFile = get(uploads, this.props.identifier, {});

    if (this.file.id !== prevFile.id && this.file.id) {
      this.props.onFileUpload(this.file);
    } else {
      this.props.onFileRemove(prevFile);
    }
  }

  onDrop = files => {
    const { identifier, upload } = this.props;

    each(
      files,
      file => upload(identifier, file)
    );
  };

  renderUploading() {
    const { classes } = this.props;

    return (
      <div className={classes.file}>
        <Loading>{Strings.uploading}</Loading>
      </div>
    );
  }

  renderRemoving() {
    const { classes } = this.props;

    return (
      <div className={classes.file}>
        <Loading>{Strings.removing}</Loading>
      </div>
    );
  }

  renderFilePreview() {
    const { classes, identifier } = this.props;

    return (
      <div className={classes.file}>
        <Typography>
          {this.file.name}

          <IconButton className={classes.removeIcon} onClick={() => this.props.remove(identifier)}>
            <ClearIcon />
          </IconButton>
        </Typography>

      </div>
    );
  }

  renderFileSelector() {
    const { classes, multiple, buttonText, accept } = this.props;

    return (
      <Dropzone onDrop={this.onDrop} className={classes.dropzone} multiple={multiple} accept={accept}>
        <Typography>
          <Button variant="raised" size="small">{buttonText}</Button> or drag and drop file{multiple ? 's' : ''}
        </Typography>
      </Dropzone>
    );
  }

  render() {
    if (this.fileState.uploading) {
      return this.renderUploading();
    }

    if (this.fileState.removing) {
      return this.renderRemoving();
    }

    if (this.fileState.uploaded) {
      return this.renderFilePreview();
    }

    return this.renderFileSelector();
  }
}

FileUploader.propTypes = {
  identifier: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  multiple: PropTypes.bool,
  accept: PropTypes.string,
  onFileUpload: PropTypes.func,
  onFileRemove: PropTypes.func,
};

FileUploader.defaultProps = {
  multiple: false,
  accept: 'image/*, .pdf',
  onFileUpload() {},
  onFileRemove() {},
};

const mapStateToProps = state => ({
  uploads: state.uploads,
});

const mapDispatchToProps = dispatch => ({
  upload: (identifier, file) => dispatch(UploadsActions.upload(identifier, file)),
  remove: identifier => dispatch(UploadsActions.remove(identifier)),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(FileUploader);
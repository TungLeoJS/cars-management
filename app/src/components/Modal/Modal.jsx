/* eslint-disable no-console */
import React, { useEffect, useRef } from 'react';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import app from '../../firebase';
import './styles.scss';

const Modal = ({
  isModalOpen,
  onClose,
  onSubmit,
  debouncedChangeHandler,
  brandDetails,
  isEdit,
  onChangeLogo,
  isDelete,
}) => {
  const inputNameRef = useRef({ value: '' });
  const inputDescRef = useRef({ value: '' });
  const inputStatusRef = useRef({ value: '' });
  const logoRef = useRef({ value: '' });

  useEffect(() => {
    if (brandDetails) {
      if (
        inputNameRef.current &&
        inputDescRef.current &&
        inputStatusRef.current &&
        logoRef.current
      ) {
        inputNameRef.current.value = brandDetails.name || '';
        inputDescRef.current.value = brandDetails.desc || '';
        inputStatusRef.current.value = brandDetails.isActive || false;
        logoRef.current.value = brandDetails.logo || '';
      }
    }
  }, [brandDetails]);

  const onChangeFileUpload = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    const fileName = new Date().getTime() + file.name;
    const storage = getStorage(app);
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
          default:
            break;
        }
      },
      (error) => {
        throw error;
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          onChangeLogo({
            name: 'logo',
            value: downloadURL,
          });
        });
      }
    );
  };

  const renderDeleteModal = () => {
    return (
      <>
        <div className='modal-header'>
          <div className='modal-header__title'>Delete Car Brand</div>
          <div onClick={onClose} className='modal-header__close-button'>
            <i className='fa-solid fa-xmark'></i>
          </div>
        </div>
        <div className='modal-main'>
          <div className='modal-message'>
            Are you sure want to delete brand{' '}
            <span className='brand-name-text'>{brandDetails.name}</span>?
          </div>
          <div className='modal-actions'>
            <div
              onClick={onClose}
              className='modal-actions__cancel button button--secondary'
            >
              No
            </div>
            <div
              onClick={onSubmit}
              className='modal-confirm button button--primary'
            >
              Yes
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderCreateEditModal = () => {
    return (
      <>
        <div className='modal-header'>
          <div className='modal-header__left'>
            <div className='modal-header__title'>
              {isEdit ? 'Update' : 'Add'} Car Brand
            </div>
            <div className='modal-header__subtitle'>
              {isEdit ? 'Update' : 'Setup new '} car brand
            </div>
          </div>
          <div onClick={onClose} className='modal-header__close-button'>
            <i className='fa-solid fa-xmark'></i>
          </div>
        </div>
        <div className='modal-main'>
          <div className='brand-logo'>
            <div className='brand-logo__title'>Brand Logo</div>
            {brandDetails?.logo ? (
              <div className='brand-logo__images'>
                <img src={brandDetails.logo} alt='brand-logo' />
              </div>
            ) : (
              <div className='brand-logo__add'>
                <input
                  name='logo'
                  className='inputFile'
                  type='file'
                  onChange={(e) => onChangeFileUpload(e)}
                />
                <i className='fa-solid fa-plus'></i>
                <span>Brand Logo</span>
              </div>
            )}
          </div>
          <div className='brand-details__title'>Brand Details</div>
          <div className='brand-details__content'>
            <div className='brand-details__name-and-status'>
              <div className='brand-details__brand-name'>
                <div className='brand-name__label'>Brand Name</div>
                <input
                  ref={inputNameRef}
                  onChange={(e) => debouncedChangeHandler(e)}
                  name='name'
                  placeholder='Input Content'
                  type='text'
                  className='brand-name__input'
                />
              </div>
              <div className='brand-details__brand-status'>
                <div className='brand-name__label'>Brand Status</div>
                <select
                  ref={inputStatusRef}
                  onChange={debouncedChangeHandler}
                  name='isActive'
                >
                  <option value={false}>Inactive</option>
                  <option value={true}>Active</option>
                </select>
              </div>
            </div>
            <div className='brand-details-description'>
              <div className='brand-details__brand-description'>
                <div className='brand-description__label'>
                  Brand Description
                </div>
                <input
                  ref={inputDescRef}
                  onChange={debouncedChangeHandler}
                  name='desc'
                  placeholder='Input Content'
                  type='text'
                  className='brand-description__input'
                />
              </div>
            </div>
          </div>
          <div className='modal-actions'>
            <div
              onClick={onClose}
              className='modal-actions__cancel button button--secondary'
            >
              Cancel
            </div>
            <div
              onClick={onSubmit}
              className='modal-actions__create button button--primary'
            >
              {isEdit ? 'Update Brand' : 'Create Brand'}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderModal = () => {
    return (
      <div className={`modal ${isDelete && 'modal--delete'}`}>
        <div className='modal-container'>
          {isDelete ? renderDeleteModal() : renderCreateEditModal()}
        </div>
      </div>
    );
  };

  return isModalOpen && renderModal();
};

export default Modal;
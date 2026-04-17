import Swal from 'sweetalert2'

const premiumSwal = Swal.mixin({
  customClass: {
    confirmButton: 'swal-btn confirm',
    cancelButton: 'swal-btn cancel',
    popup: 'swal-popup-premium',
  },
  buttonsStyling: false,
  background: '#ffffff',
  color: '#1e1b4b',
})

const alerts = {
  success: (title, text) => {
    return premiumSwal.fire({
      icon: 'success',
      title,
      text,
      timer: 2500,
      showConfirmButton: false,
      timerProgressBar: true,
    })
  },
  error: (title, text) => {
    return premiumSwal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Try Again',
    })
  },
  info: (title, text) => {
    return premiumSwal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonText: 'Okay',
    })
  },
  loading: (title, text) => {
    return premiumSwal.fire({
      title,
      text,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })
  },
  confirm: (title, text, confirmText = 'Yes, Proceed') => {
    return premiumSwal.fire({
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    })
  },
}

export default alerts

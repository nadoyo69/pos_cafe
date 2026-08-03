import Swal from 'sweetalert2'

export const showToast = (title, icon = 'success') => {
  const isDark = document.documentElement.classList.contains('dark')
  return Swal.fire({
    title,
    icon,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    background: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a'
  })
}

export const showAlert = (title, text, icon = 'info') => {
  const isDark = document.documentElement.classList.contains('dark')
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: '#3755c3',
    background: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a',
    customClass: {
      popup: 'rounded-3xl border border-slate-700 shadow-2xl'
    }
  })
}

export const showConfirm = (title, text, confirmButtonText = 'Yes, Proceed') => {
  const isDark = document.documentElement.classList.contains('dark')
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3755c3',
    cancelButtonColor: '#ef4444',
    confirmButtonText,
    cancelButtonText: 'Cancel',
    background: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a',
    customClass: {
      popup: 'rounded-3xl border border-slate-700 shadow-2xl'
    }
  })
}

export default Swal

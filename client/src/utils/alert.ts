import Swal from "sweetalert2";

export const confirmDelete = async (itemName: string) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: `Do you want to delete "${itemName}"? This action cannot be undone.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
  });

  return result.isConfirmed;
};

export const showSuccess = async (
  title: string,
  message?: string
) => {
  return Swal.fire({
    title,
    text: message,
    icon: "success",
    confirmButtonText: "OK",
    confirmButtonColor: "#16a34a",
    timer: 2000,
    timerProgressBar: true,
  });
};
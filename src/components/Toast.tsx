import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export { toast } from 'react-toastify';

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      className="mt-14 sm:mt-16"
      toastClassName="rounded-xl shadow-lg"
    />
  );
}

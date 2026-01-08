import { Link, useNavigate } from 'react-router-dom';
import styles from './NotFound.module.css';

function NotFound() {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.message}>
          The page you are looking for does not exist or has been moved.
        </p>
        <div className={styles.actions}>
          <button onClick={goBack} className={styles.backButton}>
            Go Back
          </button>
          <Link to="/dashboard" className={styles.homeLink}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;

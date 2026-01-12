import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useToast } from '../../contexts/ToastContext';
import styles from './ShareToolsModal.module.css';

function ShareToolsModal({ isOpen, onClose, referralCode, referralLink }) {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState('qr');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const canvasRef = useRef(null);

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && referralLink) {
      generateQRCode();
    }
  }, [isOpen, referralLink]);

  const generateQRCode = async () => {
    try {
      // Generate QR code as data URL
      const dataUrl = await QRCode.toDataURL(referralLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#8B5CF6', // Purple color to match theme
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  const downloadQRCode = async () => {
    try {
      // Generate high-res QR code for download
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, referralLink, {
        width: 512,
        margin: 2,
        color: {
          dark: '#8B5CF6',
          light: '#FFFFFF'
        }
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `candiez-referral-${referralCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      success('QR code downloaded!');
    } catch (err) {
      console.error('Failed to download QR code:', err);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    success(`${label} copied to clipboard!`);
  };

  // Share message templates
  const shareMessages = {
    general: `Check out Candiez! Use my referral code ${referralCode} for a special welcome bonus. ${referralLink}`,
    sms: `Hey! I love shopping at Candiez. Use my code ${referralCode} when you sign up: ${referralLink}`,
    email: {
      subject: 'Join me at Candiez!',
      body: `Hi there!\n\nI wanted to share Candiez with you - they have amazing products!\n\nUse my referral code: ${referralCode}\nOr click this link: ${referralLink}\n\nYou'll get a special welcome bonus when you sign up!\n\nEnjoy!`
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me at Candiez!',
          text: `Use my referral code ${referralCode} for a special welcome bonus!`,
          url: referralLink
        });
      } catch (err) {
        // User cancelled or share failed
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback to copy
      copyToClipboard(referralLink, 'Link');
    }
  };

  const openEmailShare = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(shareMessages.email.subject)}&body=${encodeURIComponent(shareMessages.email.body)}`;
    window.open(mailtoUrl, '_blank');
  };

  const openSmsShare = () => {
    // SMS link (works on mobile)
    const smsUrl = `sms:?body=${encodeURIComponent(shareMessages.sms)}`;
    window.open(smsUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Share Your Referral</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'qr' ? styles.active : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            QR Code
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'share' ? styles.active : ''}`}
            onClick={() => setActiveTab('share')}
          >
            Share
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'messages' ? styles.active : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
        </div>

        <div className={styles.content}>
          {/* QR Code Tab */}
          {activeTab === 'qr' && (
            <div className={styles.qrTab}>
              <div className={styles.qrCodeWrapper}>
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Referral QR Code" className={styles.qrCode} />
                ) : (
                  <div className={styles.qrPlaceholder}>Generating...</div>
                )}
              </div>
              <p className={styles.qrHelp}>
                Scan this code to open your referral link
              </p>
              <div className={styles.codeDisplay}>
                <span className={styles.codeLabel}>Your Code:</span>
                <span className={styles.codeValue}>{referralCode}</span>
              </div>
              <button className={styles.downloadBtn} onClick={downloadQRCode}>
                Download QR Code
              </button>
            </div>
          )}

          {/* Share Tab */}
          {activeTab === 'share' && (
            <div className={styles.shareTab}>
              <div className={styles.linkSection}>
                <label>Your Referral Link</label>
                <div className={styles.linkInput}>
                  <input type="text" value={referralLink} readOnly />
                  <button onClick={() => copyToClipboard(referralLink, 'Link')}>
                    Copy
                  </button>
                </div>
              </div>

              <div className={styles.linkSection}>
                <label>Your Referral Code</label>
                <div className={styles.linkInput}>
                  <input type="text" value={referralCode} readOnly />
                  <button onClick={() => copyToClipboard(referralCode, 'Code')}>
                    Copy
                  </button>
                </div>
              </div>

              <div className={styles.shareButtons}>
                {navigator.share && (
                  <button className={styles.shareBtn} onClick={handleShare}>
                    <span className={styles.shareIcon}>📤</span>
                    Share
                  </button>
                )}
                <button className={styles.shareBtn} onClick={openEmailShare}>
                  <span className={styles.shareIcon}>✉️</span>
                  Email
                </button>
                <button className={styles.shareBtn} onClick={openSmsShare}>
                  <span className={styles.shareIcon}>💬</span>
                  SMS
                </button>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className={styles.messagesTab}>
              <div className={styles.messageCard}>
                <h4>General Message</h4>
                <p className={styles.messagePreview}>{shareMessages.general}</p>
                <button
                  className={styles.copyMessageBtn}
                  onClick={() => copyToClipboard(shareMessages.general, 'Message')}
                >
                  Copy Message
                </button>
              </div>

              <div className={styles.messageCard}>
                <h4>Text Message</h4>
                <p className={styles.messagePreview}>{shareMessages.sms}</p>
                <button
                  className={styles.copyMessageBtn}
                  onClick={() => copyToClipboard(shareMessages.sms, 'Message')}
                >
                  Copy Message
                </button>
              </div>

              <div className={styles.messageCard}>
                <h4>Email Template</h4>
                <p className={styles.messagePreview}>{shareMessages.email.body}</p>
                <div className={styles.messageActions}>
                  <button
                    className={styles.copyMessageBtn}
                    onClick={() => copyToClipboard(shareMessages.email.body, 'Email body')}
                  >
                    Copy Body
                  </button>
                  <button
                    className={styles.copyMessageBtn}
                    onClick={openEmailShare}
                  >
                    Open in Email
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShareToolsModal;

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { collection, addDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Certificate, CertificateTemplate, CertificateMetadata } from '../types/certificate';

const CERTIFICATE_TEMPLATES: Record<string, CertificateTemplate> = {
  beginner: {
    backgroundColor: '#ffffff',
    borderColor: '#4CAF50',
    textColor: '#2E7D32',
    accentColor: '#81C784',
  },
  intermediate: {
    backgroundColor: '#ffffff',
    borderColor: '#2196F3',
    textColor: '#1565C0',
    accentColor: '#64B5F6',
  },
  expert: {
    backgroundColor: '#ffffff',
    borderColor: '#F44336',
    textColor: '#C62828',
    accentColor: '#E57373',
  },
};

// Generate a unique verification code
const generateVerificationCode = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Create certificate HTML template
const createCertificateHTML = (
  certificate: Certificate,
  template: CertificateTemplate
): HTMLElement => {
  const container = document.createElement('div');
  container.style.width = '1000px';
  container.style.height = '700px';
  container.style.padding = '40px';
  container.style.position = 'relative';
  container.style.backgroundColor = template.backgroundColor;
  container.style.border = `20px solid ${template.borderColor}`;
  container.style.boxSizing = 'border-box';

  container.innerHTML = `
    <div style="text-align: center; color: ${template.textColor};">
      <h1 style="font-size: 48px; margin-bottom: 20px; color: ${template.accentColor};">
        Certificate of Achievement
      </h1>
      <p style="font-size: 24px; margin-bottom: 40px;">
        This is to certify that
      </p>
      <h2 style="font-size: 36px; margin-bottom: 40px; color: ${template.textColor};">
        ${certificate.userName}
      </h2>
      <p style="font-size: 24px; margin-bottom: 20px;">
        has successfully completed all ${certificate.challengeLevel} level React coding challenges
      </p>
      <p style="font-size: 20px; margin-bottom: 40px;">
        Completing ${certificate.completedChallenges} out of ${certificate.totalChallenges} challenges
      </p>
      <div style="margin-top: 60px; display: flex; justify-content: space-between; padding: 0 100px;">
        <div>
          <p style="font-size: 20px;">Date Issued</p>
          <p style="font-size: 18px;">${certificate.issueDate.toLocaleDateString()}</p>
        </div>
        <div>
          <p style="font-size: 20px;">Certificate ID</p>
          <p style="font-size: 18px;">${certificate.id}</p>
        </div>
      </div>
      <div id="qrcode-${certificate.id}" style="position: absolute; bottom: 40px; right: 40px;"></div>
    </div>
  `;

  return container;
};

// Generate QR code for certificate verification
const generateQRCode = async (verificationUrl: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(verificationUrl);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Save certificate to Firestore
const saveCertificate = async (certificate: Certificate): Promise<void> => {
  try {
    const certificatesRef = collection(db, 'certificates');
    await addDoc(certificatesRef, {
      ...certificate,
      issueDate: certificate.issueDate.toISOString(),
    });
  } catch (error) {
    console.error('Error saving certificate:', error);
    throw error;
  }
};

// Generate and download certificate
export const generateCertificate = async (
  userId: string,
  userName: string,
  challengeLevel: Certificate['challengeLevel'],
  completedChallenges: number,
  totalChallenges: number
): Promise<string> => {
  try {
    const certificate: Certificate = {
      id: `CERT-${Date.now()}-${userId.substring(0, 6)}`,
      userId,
      userName,
      challengeLevel,
      issueDate: new Date(),
      completedChallenges,
      totalChallenges,
      verificationCode: generateVerificationCode(),
    };

    const template = CERTIFICATE_TEMPLATES[challengeLevel];
    const container = createCertificateHTML(certificate, template);
    document.body.appendChild(container);

    const verificationUrl = `${window.location.origin}/verify-certificate/${certificate.id}`;
    const qrCodeData = await generateQRCode(verificationUrl);

    const qrCodeElement = container.querySelector(`#qrcode-${certificate.id}`);
    if (qrCodeElement) {
      const img = document.createElement('img');
      img.src = qrCodeData;
      img.style.width = '100px';
      img.style.height = '100px';
      qrCodeElement.appendChild(img);
    }

    const canvas = await html2canvas(container);
    document.body.removeChild(container);

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [1000, 700],
    });

    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      0,
      1000,
      700
    );

    // Save to Firestore
    await saveCertificate(certificate);

    // Generate PDF URL
    const pdfUrl = URL.createObjectURL(pdf.output('blob'));
    
    return pdfUrl;
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
};

// Verify certificate
export const verifyCertificate = async (
  certificateId: string
): Promise<CertificateMetadata | null> => {
  try {
    const certificatesRef = collection(db, 'certificates');
    const q = query(certificatesRef, where('id', '==', certificateId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const certificateData = querySnapshot.docs[0].data() as Certificate;
    
    return {
      certificateId: certificateData.id,
      issuedTo: certificateData.userName,
      issuedOn: new Date(certificateData.issueDate).toLocaleDateString(),
      achievement: `Completed ${certificateData.challengeLevel} level React challenges`,
      verificationUrl: `${window.location.origin}/verify-certificate/${certificateId}`,
    };
  } catch (error) {
    console.error('Error verifying certificate:', error);
    throw error;
  }
}; 
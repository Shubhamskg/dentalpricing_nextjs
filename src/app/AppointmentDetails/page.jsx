"use client"
import React, { useState, useEffect } from 'react';
import { format, parse, isAfter, isValid, parseISO } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { Calendar, Clock, User, Mail, Phone, FileText, MapPin, Stethoscope, PoundSterling, Download, CreditCard, Notebook, MessageCircle, NotepadText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import styles from './page.module.scss';

const TIME_SLOTS = {
  '9-11': '9:00 AM - 11:00 AM',
  '11-13': '11:00 AM - 1:00 PM',
  '13-15': '1:00 PM - 3:00 PM',
  '15-17': '3:00 PM - 5:00 PM',
};

function AppointmentDetails({ bookingId }) {
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (bookingId) {
        try {
          const response = await fetch(`/api/booking?id=${bookingId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch appointment details');
          }
          const data = await response.json();
          setAppointmentDetails(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAppointmentDetails();
  }, [bookingId]);

  const formatDateAndTime = (date, timeSlot) => {
    if (!date || !timeSlot) return 'Date and time not set';
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    if (!isValid(parsedDate)) return 'Invalid date';
    const formattedDate = format(parsedDate, 'MMMM d, yyyy', { locale: enGB });
    return `${formattedDate} ${TIME_SLOTS[timeSlot]}`;
  };

  const formatBookingTime = (timestamp) => {
    if (!timestamp) return 'Booking time not available';
    const date = parseISO(timestamp);
    return format(date, 'MMMM d, yyyy HH:mm:ss', { locale: enGB });
  };
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Set up fonts
    doc.setFont("helvetica");

    // Add background color
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 210, 297, 'F');

    // Add header
    doc.setFillColor(74, 144, 226);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text('Dental Booking', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text('dentalbooking.co.uk', 105, 28, { align: 'center' });
    
    // Add appointment details
    doc.setTextColor(74, 144, 226);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text('Appointment Confirmation', 105, 55, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.setFont("helvetica", "normal");
    
    const tableData = [
      ['Appointment Date/Time', formatDateAndTime(appointmentDetails.preferredDate, appointmentDetails.preferredTimeSlot)],
      ['Treatment', appointmentDetails.treatment[0].toUpperCase()+appointmentDetails.treatment.slice(1)],
      ['Clinic', appointmentDetails.clinic],
      ['Patient Name', appointmentDetails.name],
      ['Phone', appointmentDetails.phone],
      ['Booking ID', appointmentDetails._id],
      ['Booking Date', format(parseISO(appointmentDetails.createdAt), 'MMMM d, yyyy', { locale: enGB })],
      ['Deposit Amount', `£${appointmentDetails.depositAmount}`],
      ['Payment Status', appointmentDetails.paymentStatus[0].toUpperCase()+appointmentDetails.paymentStatus.slice(1)],
    ];

    doc.autoTable({
      startY: 65,
      head: [['Field', 'Details']],
      body: tableData,
      theme: 'plain',
      headStyles: { 
        fillColor: [74, 144, 226], 
        textColor: [255],
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: {top: 5, right: 10, bottom: 5, left: 10},
      },
      bodyStyles: {
        textColor: [80],
        cellPadding: {top: 4, right: 10, bottom: 4, left: 10},
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      columnStyles: { 
        0: { fontStyle: 'bold', cellWidth: 70 },
        1: { cellWidth: 'auto' },
      },
      didDrawPage: function (data) {
        // Footer
        doc.setFillColor(74, 144, 226);
        doc.rect(0, 277, 210, 20, 'F');
        doc.setFont("helvetica");
        doc.setFontSize(10);
        doc.setTextColor(255);
        doc.text('For any queries, please contact us:', 105, 285, { align: 'center' });
        doc.text('Phone: +44 7590 324762 | Email: support@dentaladvisor.ai', 105, 291, { align: 'center' });

        // Page numbers
        doc.setFontSize(10);
        doc.text(`Page ${data.pageCount}`, 195, 287, { align: 'right' });
      },
      margin: { top: 60 },
    });

    // Add issue/notes
    const finalY = doc.lastAutoTable.finalY || 65;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(74, 144, 226);
    doc.text('Additional Notes:', 14, finalY + 15);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    const splitText = doc.splitTextToSize(appointmentDetails.issue || 'No additional notes provided.', 180);
    doc.text(splitText, 14, finalY + 25);

    doc.save(`dental_appointment_${appointmentDetails._id}.pdf`);
  };




  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!appointmentDetails) return <div className={styles.error}>No appointment details found.</div>;

  const preferredDateTime = formatDateAndTime(appointmentDetails.preferredDate, appointmentDetails.preferredTimeSlot);
  const alternativeDateTime = formatDateAndTime(appointmentDetails.alternativeDate, appointmentDetails.alternativeTimeSlot);

  const isAlternativeLater = isAfter(
    parse(`${appointmentDetails.alternativeDate || ''} ${(appointmentDetails.alternativeTimeSlot || '').split('-')[0]}`, 'yyyy-MM-dd HH', new Date()),
    parse(`${appointmentDetails.preferredDate || ''} ${(appointmentDetails.preferredTimeSlot || '').split('-')[0]}`, 'yyyy-MM-dd HH', new Date())
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {appointmentDetails.paymentStatus === 'succeeded' ? 'Appointment Confirmed' : 'Appointment Status'}
      </h1>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Patient Information</h2>
          <button className={styles.downloadBtn} onClick={downloadPDF}>
            <Download size={18} />
            Download PDF
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.detailItem}>
            <User size={20} />
            <span>{appointmentDetails.name}</span>
          </div>
          <div className={styles.detailItem}>
            <Mail size={20} />
            <span>{appointmentDetails.email}</span>
          </div>
          <div className={styles.detailItem}>
            <Phone size={20} />
            <span>{appointmentDetails.phone}</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2>Appointment Details</h2>
        <div className={styles.content}>
          <div className={styles.detailItem}>
            <Calendar size={20} />
            <span>Preferred: {preferredDateTime}</span>
          </div>
          <div className={styles.detailItem}>
            <Clock size={20} />
            <span>Alternative: {alternativeDateTime}</span>
          </div>
          {!isAlternativeLater && (
            <p className={styles.warning}>
              Note: The alternative date/time is not after the preferred date/time. This may affect scheduling.
            </p>
          )}
          <div className={styles.detailItem}>
            <MapPin size={20} />
            <span>Clinic: {appointmentDetails.clinic}</span>
          </div>
          <div className={styles.detailItem}>
            <Stethoscope size={20} />
            <span>Treatment: {appointmentDetails.treatment[0].toUpperCase()+appointmentDetails.treatment.slice(1)}</span>
          </div>
          <div className={styles.detailItem}>
            <Clock size={20} />
            <span>Booking Time: {formatBookingTime(appointmentDetails.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2>Payment Information</h2>
        <div className={styles.content}>
          <div className={styles.detailItem}>
            <PoundSterling size={20} />
            <span>Deposit amount: £{appointmentDetails.depositAmount}</span>
          </div>
          <div className={styles.detailItem}>
            <FileText size={20} />
            <span>Payment status: {appointmentDetails.paymentStatus[0].toUpperCase()+appointmentDetails.paymentStatus.slice(1)}</span>/
          </div>
          <div className={styles.detailItem}>
            <CreditCard size={20} />
            <span>Payment Transaction ID: {appointmentDetails.paymentIntentId || 'Not available'}</span>
          </div>
          <p className={styles.bookingId}>Booking ID: {appointmentDetails._id}</p>
        </div>
      </div>

      <div className={styles.card}>
        <h2>Additional Information</h2>
        <div className={styles.content}>
          <div className={styles.detailItem}>
            <NotepadText size={20} />
            <div className={styles.issueContainer}>
              <span className={styles.issueLabel}>Issue/Notes:</span>
              <p className={styles.issueText}>
                {appointmentDetails.issue || 'No additional notes provided.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className={styles.reminder}>
        {appointmentDetails.paymentStatus === 'succeeded'
          ? 'Please arrive 10 minutes before your appointment time.'
          : 'If you have any questions about your appointment or payment, please contact our support team.'}
      </p>
    </div>
  );
}

export default AppointmentDetails;
// Email Transporter Helper (Nodemailer setup)
export const sendEmail = async ({ to, subject, html, text }) => {
  // e.g. await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html, text })
  console.log(`[Email Mock] Sent to: ${to} | Subject: ${subject}`)
  return { success: true }
}

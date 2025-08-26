import { transporter,sender} from "./mailer.js"
import  { VERIFICATION_EMAIL_TEMPLATE,WELCOME_PAGE_TEMPLATE ,PASSWORD_RESET_REQUEST_TEMPLATE,PASSWORD_RESET_SUCCESS_TEMPLATE} from "./emailTemplates.js"
import dotenv from 'dotenv'

dotenv.config()

export const sendVerificationEmail=async(name,email,verificationToken)=>{
    const recipient=[email]
    
try {
  const response= transporter.sendMail({
      from: sender,
      to: recipient,
      subject: "Email verification",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken).replace("{username}", name),
      category: "Email Verification"
  })
    console.log("mail has been sent",response);
    return response;
} catch (error) {
    console.log("error while sending verification", error);
    throw new Error(`Error sending email: ${error}`)
}
}


export const sendWelcomeEmail=async (name,email)=>{
    const recipient=[email]
    
try {
  const response= transporter.sendMail({
      from: sender,
      to: recipient,
      subject: "Email verification",
      html: WELCOME_PAGE_TEMPLATE.replace("{username}", name),
      category: "Welcome Email"
  })
  console.log("welcome mail has been sent",response);
} catch (error) {
    console.log("error while sending welcome ", error);
    throw new Error(`Error sending welcome email: ${error}`)
}
}

export const sendResetPasswordEmail=async (name,email,resetURL)=>{

    const recipient=[email]
    try {
      const response= transporter.sendMail({
          from: sender,
          to: recipient,
          subject: "Reset Password Request",
          html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{username}", name).replace("{resetURL}",resetURL),
          category: "Reset Password Email"
      })
      console.log("reset password mail has been sent",response);
    } catch (error) {
        console.log("error while sending reset password email", error);
        throw new Error(`Error sending reset password email: ${error}`)
    }
}

export const sendResetSuccessEmail=async (name,email)=>{

    const recipient=[email]
    try {
        const response= transporter.sendMail({
            from: sender,
            to: recipient,
            subject: "Reset Password success email",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace("{username}", name),
            category: "Reset Password Email success email"
        })    
    console.log("reset password mail has been sent successfully",response);
    
    } catch (error) {
        console.log("error while sending reset password success email", error);
        throw new Error(`Error sending reset password success email: ${error}`)
    }
}
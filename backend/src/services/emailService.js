const nodemailer = require("nodemailer");

const createTransporter = () => {
    if (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
        return nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS,
            },
        });
    }

    return null;
};

const transporter = createTransporter();

// Email templates
const templates = {
    taskCreated: (task, projectName) => ({
        subject: `New Task Created: ${task.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0;">New Task Created</h2>
                </div>
                <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <h3 style="color: #1f2937; margin-top: 0;">${task.title}</h3>
                    <p style="color: #6b7280;">${task.description || "No description"}</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Project:</td>
                            <td style="padding: 8px 0; font-weight: bold;">${projectName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Status:</td>
                            <td style="padding: 8px 0;"><span style="background: #e5e7eb; padding: 4px 12px; border-radius: 20px; font-size: 14px;">${task.status}</span></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Priority:</td>
                            <td style="padding: 8px 0;"><span style="background: ${task.priority === 'HIGH' ? '#FEE2E2' : task.priority === 'LOW' ? '#D1FAE5' : '#FEF3C7'}; color: ${task.priority === 'HIGH' ? '#DC2626' : task.priority === 'LOW' ? '#059669' : '#D97706'}; padding: 4px 12px; border-radius: 20px; font-size: 14px;">${task.priority}</span></td>
                        </tr>
                        ${task.dueDate ? `
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Due Date:</td>
                            <td style="padding: 8px 0; font-weight: bold;">${new Date(task.dueDate * 1000).toLocaleDateString()}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
                    Voice-Enabled Task Tracker
                </p>
            </div>
        `,
    }),

    taskUpdated: (task, projectName, changes) => ({
        subject: `Task Updated: ${task.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #8B5CF6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0;">Task Updated</h2>
                </div>
                <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <h3 style="color: #1f2937; margin-top: 0;">${task.title}</h3>
                    <p style="color: #6b7280;">Project: ${projectName}</p>
                    
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <h4 style="margin: 0 0 10px 0; color: #4b5563;">Changes Made:</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                            ${changes.map(c => `<li>${c}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
                    Voice-Enabled Task Tracker
                </p>
            </div>
        `,
    }),

    taskDeleted: (taskTitle, projectName) => ({
        subject: `Task Deleted: ${taskTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #EF4444; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0;">Task Deleted</h2>
                </div>
                <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <h3 style="color: #1f2937; margin-top: 0;">${taskTitle}</h3>
                    <p style="color: #6b7280;">This task has been removed from project: <strong>${projectName}</strong></p>
                </div>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
                    Voice-Enabled Task Tracker
                </p>
            </div>
        `,
    }),

    taskStatusChanged: (task, projectName, oldStatus, newStatus) => ({
        subject: `Task Status Changed: ${task.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #10B981; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0;">Task Status Updated</h2>
                </div>
                <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <h3 style="color: #1f2937; margin-top: 0;">${task.title}</h3>
                    <p style="color: #6b7280;">Project: ${projectName}</p>
                    
                    <div style="display: flex; align-items: center; justify-content: center; margin: 20px 0; gap: 15px;">
                        <span style="background: #e5e7eb; padding: 8px 16px; border-radius: 20px;">${oldStatus.replace('_', ' ')}</span>
                        <span style="font-size: 24px;">→</span>
                        <span style="background: ${newStatus === 'DONE' ? '#D1FAE5' : newStatus === 'IN_PROGRESS' ? '#DBEAFE' : '#e5e7eb'}; color: ${newStatus === 'DONE' ? '#059669' : newStatus === 'IN_PROGRESS' ? '#2563EB' : '#4b5563'}; padding: 8px 16px; border-radius: 20px; font-weight: bold;">${newStatus.replace('_', ' ')}</span>
                    </div>
                </div>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
                    Voice-Enabled Task Tracker
                </p>
            </div>
        `,
    }),
};

// Send email function
const sendEmail = async (to, template, data) => {
    try {
        const emailContent = templates[template](...data);

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Task Tracker" <noreply@tasktracker.app>',
            to,
            subject: emailContent.subject,
            html: emailContent.html,
        };

        // If no transporter configured, log to console instead
        if (!transporter) {
            console.log("EMAIL (console only - no Mailtrap config):");
            console.log("   To:", to);
            console.log("   Subject:", emailContent.subject);
            return { messageId: "console-only" };
        }

        const result = await transporter.sendMail(mailOptions);
        console.log(`Email sent to Mailtrap: ${template} to ${to}`);
        return result;
    } catch (err) {
        console.error("Failed to send email:", err.message);
        // Don't throw - email failure shouldn't break the app
        return null;
    }
};

module.exports = {
    sendEmail,
    templates,
};

import emailjs from '@emailjs/browser';

// Инициализация с ключом
emailjs.init('3gx-_V_nT9wo1wTQ-');

// Конфигурация
const config = {
  serviceId: 'service_o8oxsur',
  templateId: 'template_97gya3f',
  replyTo: 'reelvibeins@gmail.com'
};

// Шаблоны писем
const emailTemplates = {
  welcome: {
    subject: '🚀 Welcome to VISOLARO!',
    getMessage: (name) => `
      <h2 style="color: #667eea; margin-bottom: 15px;">Hello ${name}!</h2>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Welcome to VISOLARO CRM! We're excited to have you on board.</p>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Start by adding your first customer or exploring the dashboard.</p>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Best regards,<br>The VISOLARO Team</p>
    `
  },
  test: {
    subject: '✅ VISOLARO Test Email',
    getMessage: (name) => `
      <h2 style="color: #667eea; margin-bottom: 15px;">Hello ${name}!</h2>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">This is a test email from your VISOLARO system.</p>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">If you received this, everything is working perfectly! ✨</p>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Best regards,<br>VISOLARO</p>
    `
  },
  reminder: {
    subject: '⏰ Meeting Reminder',
    getMessage: (name, details) => `
      <h2 style="color: #667eea; margin-bottom: 15px;">Hi ${name},</h2>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">This is a reminder for your upcoming meeting:</p>
      <p style="color: #4a5568; font-size: 18px; font-weight: 600; padding: 10px; background: #f7fafc; border-radius: 8px;"><strong>${details}</strong></p>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Don't forget to check your calendar!</p>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Best regards,<br>VISOLARO</p>
    `
  },
  birthday: {
    subject: '🎂 Happy Birthday!',
    getMessage: (name) => `
      <h2 style="color: #667eea; margin-bottom: 15px;">Happy Birthday ${name}!</h2>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Wishing you a fantastic day from all of us at VISOLARO! 🎉</p>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Best regards,<br>The VISOLARO Team</p>
    `
  },
  dealWon: {
    subject: '🏆 Deal Won! Congratulations!',
    getMessage: (name, dealName) => `
      <h2 style="color: #667eea; margin-bottom: 15px;">Congratulations ${name}!</h2>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Great news! The deal <strong style="color: #667eea;">${dealName}</strong> has been won.</p>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Keep up the great work!</p>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Best regards,<br>VISOLARO</p>
    `
  },
  inactive: {
    subject: '👋 Customer Check-in',
    getMessage: (name, customerName) => `
      <h2 style="color: #667eea; margin-bottom: 15px;">Hi ${name},</h2>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">It's been a while since you last contacted <strong style="color: #667eea;">${customerName}</strong>.</p>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Maybe it's time to reach out and reconnect?</p>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Best regards,<br>VISOLARO</p>
    `
  },
  newsletter: {
    subject: '📧 VISOLARO Newsletter',
    getMessage: (name, content) => {
      // Если контент уже содержит HTML, оставляем как есть
      if (content && (content.includes('<') && content.includes('>'))) {
        return `
          <h2 style="color: #667eea; margin-bottom: 15px;">Hello ${name}!</h2>
          ${content}
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Best regards,<br>VISOLARO Team</p>
        `;
      } else {
        // Если простой текст, оборачиваем в параграф
        return `
          <h2 style="color: #667eea; margin-bottom: 15px;">Hello ${name}!</h2>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">${content || 'Here is your newsletter update.'}</p>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Best regards,<br>VISOLARO Team</p>
        `;
      }
    }
  }
};

// Основная функция отправки
export const sendEmail = async (toEmail, toName, template = 'test', data = {}) => {
  console.log('📧 Sending email:', { toEmail, toName, template });
  
  try {
    const selectedTemplate = emailTemplates[template];
    if (!selectedTemplate) {
      throw new Error(`Template "${template}" not found`);
    }

    let message = '';
    
    // Формируем сообщение в зависимости от шаблона
    switch(template) {
      case 'reminder':
        message = selectedTemplate.getMessage(toName, data.details);
        break;
      case 'dealWon':
        message = selectedTemplate.getMessage(toName, data.dealName);
        break;
      case 'inactive':
        message = selectedTemplate.getMessage(toName, data.customerName);
        break;
      case 'newsletter':
        message = selectedTemplate.getMessage(toName, data.content);
        break;
      default:
        message = selectedTemplate.getMessage(toName);
    }

    // ВАЖНО: Используем правильные имена переменных как в шаблоне
    const templateParams = {
      email: toEmail,
      to_name: toName,
      from_name: 'VISOLARO',
      subject: data.subject || selectedTemplate.subject,
      message: message,
      reply_to: config.replyTo
    };

    console.log('📝 Template params:', templateParams);

    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams
    );

    console.log('✅ Email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { 
      success: false, 
      error: {
        message: error.message,
        text: error.text,
        status: error.status
      }
    };
  }
};

// Специализированные функции
export const sendWelcomeEmail = (toEmail, toName) => {
  return sendEmail(toEmail, toName, 'welcome');
};

export const sendTestEmail = (toEmail) => {
  return sendEmail(toEmail, 'Test User', 'test');
};

export const sendReminderEmail = (toEmail, toName, details) => {
  return sendEmail(toEmail, toName, 'reminder', { details });
};

export const sendBirthdayEmail = (toEmail, toName) => {
  return sendEmail(toEmail, toName, 'birthday');
};

export const sendDealWonEmail = (toEmail, toName, dealName) => {
  return sendEmail(toEmail, toName, 'dealWon', { dealName });
};

export const sendInactiveCustomerEmail = (toEmail, toName, customerName) => {
  return sendEmail(toEmail, toName, 'inactive', { customerName });
};

export const sendNewsletter = (toEmail, toName, subject, content) => {
  return sendEmail(toEmail, toName, 'newsletter', { subject, content });
};

// Массовая рассылка
export const sendBulkNewsletter = async (recipients, subject, content) => {
  const results = [];
  for (const recipient of recipients) {
    const result = await sendNewsletter(
      recipient.email,
      recipient.name,
      subject,
      content
    );
    results.push(result);
    // Задержка между отправками
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  return results;
};

// Проверка подключения
export const testConnection = async () => {
  try {
    const result = await sendTestEmail('test@example.com');
    return result.success;
  } catch {
    return false;
  }
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendTestEmail,
  sendReminderEmail,
  sendBirthdayEmail,
  sendDealWonEmail,
  sendInactiveCustomerEmail,
  sendNewsletter,
  sendBulkNewsletter,
  testConnection
};
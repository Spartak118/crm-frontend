import { sendWelcomeEmail, sendDealWonEmail, sendInactiveCustomerEmail } from './EmailService';

// Автоматические письма при событиях
export const setupAutoEmails = (store) => {
  const { currentUser, customers, addNotification } = store;

  // При добавлении нового клиента
  const onCustomerAdded = (customer) => {
    if (customer.email) {
      sendWelcomeEmail(customer.email, customer.name);
      addNotification({
        title: '✉️ Welcome Email Sent',
        message: `To ${customer.name}`,
        icon: '📧',
        type: 'success'
      });
    }
  };

  // При закрытии сделки
  const onDealWon = (deal, customer) => {
    if (customer?.email) {
      sendDealWonEmail(customer.email, customer.name, deal.name);
    }
  };

  // Проверка неактивных клиентов (раз в день)
  const checkInactiveCustomers = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    customers.forEach(customer => {
      const lastContact = new Date(customer.lastContact);
      if (lastContact < sevenDaysAgo && customer.email) {
        sendInactiveCustomerEmail(customer.email, customer.name, customer.name);
      }
    });
  };

  return {
    onCustomerAdded,
    onDealWon,
    checkInactiveCustomers
  };
};
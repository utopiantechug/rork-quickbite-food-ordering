import { Platform, Alert, Share } from 'react-native';
import * as Linking from 'expo-linking';
import { Order } from '@/types';

export const generateInvoiceText = (order: Order): string => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  let invoiceText = `🥖 GOLDEN CRUST BAKERY - INVOICE 🥖

`;
  invoiceText += `Invoice #: INV-${order.id}
`;
  invoiceText += `Order Date: ${formatDate(order.orderDate)} at ${formatTime(order.orderDate)}
`;
  invoiceText += `Delivery Date: ${formatDate(order.deliveryDate)}
`;
  invoiceText += `Status: ✅ Ready for Pickup

`;
  
  invoiceText += `📋 CUSTOMER DETAILS:
`;
  invoiceText += `Name: ${order.customerName}
`;
  invoiceText += `Phone: ${order.customerPhone}
`;
  invoiceText += `Email: ${order.customerEmail}

`;
  
  invoiceText += `🛒 ORDER ITEMS:
`;
  invoiceText += `${'─'.repeat(40)}
`;
  
  order.items.forEach((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    invoiceText += `${index + 1}. ${item.product.name}
`;
    invoiceText += `   Qty: ${item.quantity} × $${item.product.price.toFixed(2)} = $${itemTotal.toFixed(2)}

`;
  });
  
  invoiceText += `${'─'.repeat(40)}
`;
  invoiceText += `💰 TOTAL AMOUNT: $${order.total.toFixed(2)}
`;
  invoiceText += `${'─'.repeat(40)}

`;
  
  invoiceText += `🎉 Thank you for choosing Golden Crust Bakery!
`;
  invoiceText += `Your order is ready for pickup.
`;
  
  if (order.estimatedTime) {
    invoiceText += `Preparation time: ${order.estimatedTime}
`;
  }
  
  invoiceText += `
We appreciate your business! 🙏`;
  
  return invoiceText;
};

export const shareViaWhatsApp = async (order: Order) => {
  try {
    const invoiceText = generateInvoiceText(order);
    const phoneNumber = order.customerPhone.replace(/[^\d]/g, ''); // Remove non-digits
    
    // Format phone number for WhatsApp (add country code if not present)
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith('1') && phoneNumber.length === 10) {
      formattedPhone = '1' + phoneNumber; // Add US country code
    }
    
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(invoiceText)}`;
    
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    } else {
      // Fallback to general sharing
      await shareInvoice(order);
    }
  } catch (error) {
    console.error('WhatsApp sharing error:', error);
    Alert.alert('Error', 'Failed to share via WhatsApp. Trying general share...');
    await shareInvoice(order);
  }
};

export const shareViaEmail = async (order: Order) => {
  try {
    const invoiceText = generateInvoiceText(order);
    const subject = `Invoice #INV-${order.id} - Golden Crust Bakery`;
    
    if (Platform.OS === 'web') {
      // Use mailto for web
      const mailtoUrl = `mailto:${order.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(invoiceText)}`;
      window.open(mailtoUrl);
    } else {
      // Try to use mail composer for mobile
      try {
        const { MailComposer } = await import('expo-mail-composer');
        const isAvailable = await MailComposer.isAvailableAsync();
        
        if (isAvailable) {
          await MailComposer.composeAsync({
            recipients: [order.customerEmail],
            subject: subject,
            body: invoiceText,
          });
        } else {
          throw new Error('Mail composer not available');
        }
      } catch (mailError) {
        // Fallback to general sharing
        await shareInvoice(order);
      }
    }
  } catch (error) {
    console.error('Email sharing error:', error);
    Alert.alert('Error', 'Failed to share via email. Trying general share...');
    await shareInvoice(order);
  }
};

export const shareInvoice = async (order: Order) => {
  try {
    const invoiceText = generateInvoiceText(order);
    const title = `Invoice #INV-${order.id} - Golden Crust Bakery`;
    
    if (Platform.OS === 'web') {
      // For web, use the Web Share API if available, otherwise copy to clipboard
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: invoiceText,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(invoiceText);
        Alert.alert('Copied!', 'Invoice copied to clipboard');
      } else {
        // Fallback: create a downloadable text file
        const blob = new Blob([invoiceText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${order.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } else {
      // For mobile, use React Native's Share API
      const result = await Share.share({
        message: invoiceText,
        title: title,
      });
      
      if (result.action === Share.dismissedAction) {
        // User dismissed the share dialog
        console.log('Share dismissed');
      }
    }
  } catch (error) {
    console.error('General sharing error:', error);
    Alert.alert('Error', 'Failed to share invoice. Please try again.');
  }
};
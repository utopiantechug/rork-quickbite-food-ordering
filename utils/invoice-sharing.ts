import { Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
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

  let invoiceText = `🥖 GOLDEN CRUST BAKERY - INVOICE 🥖\n\n`;
  invoiceText += `Invoice #: INV-${order.id}\n`;
  invoiceText += `Order Date: ${formatDate(order.orderDate)} at ${formatTime(order.orderDate)}\n`;
  invoiceText += `Delivery Date: ${formatDate(order.deliveryDate)}\n`;
  invoiceText += `Status: ✅ Ready for Pickup\n\n`;
  
  invoiceText += `📋 CUSTOMER DETAILS:\n`;
  invoiceText += `Name: ${order.customerName}\n`;
  invoiceText += `Phone: ${order.customerPhone}\n`;
  invoiceText += `Email: ${order.customerEmail}\n\n`;
  
  invoiceText += `🛒 ORDER ITEMS:\n`;
  invoiceText += `${'─'.repeat(40)}\n`;
  
  order.items.forEach((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    invoiceText += `${index + 1}. ${item.product.name}\n`;
    invoiceText += `   Qty: ${item.quantity} × $${item.product.price.toFixed(2)} = $${itemTotal.toFixed(2)}\n\n`;
  });
  
  invoiceText += `${'─'.repeat(40)}\n`;
  invoiceText += `💰 TOTAL AMOUNT: $${order.total.toFixed(2)}\n`;
  invoiceText += `${'─'.repeat(40)}\n\n`;
  
  invoiceText += `🎉 Thank you for choosing Golden Crust Bakery!\n`;
  invoiceText += `Your order is ready for pickup.\n`;
  
  if (order.estimatedTime) {
    invoiceText += `Preparation time: ${order.estimatedTime}\n`;
  }
  
  invoiceText += `\nWe appreciate your business! 🙏`;
  
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
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(invoiceText, {
          mimeType: 'text/plain',
          dialogTitle: 'Share Invoice',
        });
      } else {
        Alert.alert('Sharing not available', 'Unable to share invoice on this device');
      }
    }
  } catch (error) {
    console.error('WhatsApp sharing error:', error);
    Alert.alert('Error', 'Failed to share via WhatsApp');
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
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(invoiceText, {
            mimeType: 'text/plain',
            dialogTitle: 'Share Invoice via Email',
          });
        } else {
          Alert.alert('Email not available', 'Unable to send email on this device');
        }
      }
    }
  } catch (error) {
    console.error('Email sharing error:', error);
    Alert.alert('Error', 'Failed to share via email');
  }
};

export const shareInvoice = async (order: Order) => {
  try {
    const invoiceText = generateInvoiceText(order);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(invoiceText, {
        mimeType: 'text/plain',
        dialogTitle: 'Share Invoice',
      });
    } else {
      Alert.alert('Sharing not available', 'Unable to share invoice on this device');
    }
  } catch (error) {
    console.error('General sharing error:', error);
    Alert.alert('Error', 'Failed to share invoice');
  }
};
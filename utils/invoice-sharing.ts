import { Platform, Alert, Share } from 'react-native';
import * as Linking from 'expo-linking';
import * as MailComposer from 'expo-mail-composer';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Order } from '@/types';

const generateInvoiceHTML = (order: Order): string => {
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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice #INV-${order.id}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .invoice {
          background: white;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #D4A574;
        }
        .bakery-name {
          font-size: 32px;
          font-weight: 700;
          color: #2D1810;
          margin-bottom: 8px;
        }
        .bakery-subtitle {
          font-size: 18px;
          color: #6B5B73;
          margin-bottom: 20px;
        }
        .invoice-title {
          font-size: 28px;
          font-weight: 600;
          color: #D4A574;
          letter-spacing: 2px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #2D1810;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #E8E8E8;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .label {
          font-weight: 500;
          color: #6B5B73;
        }
        .value {
          font-weight: 600;
          color: #2D1810;
        }
        .status-ready {
          color: #27AE60;
        }
        .customer-name {
          font-size: 18px;
          font-weight: 600;
          color: #2D1810;
          margin-bottom: 5px;
        }
        .customer-info {
          color: #6B5B73;
          margin-bottom: 3px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .items-table th {
          background-color: #F5F1EB;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #2D1810;
          border-bottom: 1px solid #E8E8E8;
        }
        .items-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #F5F1EB;
          color: #2D1810;
        }
        .items-table .qty, .items-table .price, .items-table .total {
          text-align: right;
        }
        .items-table .total {
          font-weight: 600;
        }
        .total-section {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 3px solid #D4A574;
          text-align: right;
        }
        .total-amount {
          font-size: 28px;
          font-weight: 700;
          color: #D4A574;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E8E8E8;
          text-align: center;
          color: #6B5B73;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <div class="bakery-name">Golden Crust Bakery</div>
          <div class="bakery-subtitle">Artisan Bakery</div>
          <div class="invoice-title">INVOICE</div>
        </div>

        <div class="section">
          <div class="info-row">
            <span class="label">Invoice #:</span>
            <span class="value">INV-${order.id}</span>
          </div>
          <div class="info-row">
            <span class="label">Order Date:</span>
            <span class="value">${formatDate(order.orderDate)} at ${formatTime(order.orderDate)}</span>
          </div>
          <div class="info-row">
            <span class="label">Delivery Date:</span>
            <span class="value">${formatDate(order.deliveryDate)}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value status-ready">Ready for Pickup</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Bill To:</div>
          <div class="customer-name">${order.customerName}</div>
          <div class="customer-info">${order.customerPhone}</div>
          <div class="customer-info">${order.customerEmail}</div>
        </div>

        <div class="section">
          <div class="section-title">Order Items:</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th class="qty">Qty</th>
                <th class="price">Price</th>
                <th class="total">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.product.name}</td>
                  <td class="qty">${item.quantity}</td>
                  <td class="price">$${item.product.price.toFixed(2)}</td>
                  <td class="total">$${(item.product.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="total-section">
          <div style="font-size: 20px; font-weight: 600; color: #2D1810; margin-bottom: 10px;">
            Total Amount:
          </div>
          <div class="total-amount">$${order.total.toFixed(2)}</div>
        </div>

        <div class="footer">
          <p><strong>Thank you for choosing Golden Crust Bakery!</strong></p>
          <p>Your order is ready for pickup.</p>
          ${order.estimatedTime ? `<p>Estimated preparation time was: ${order.estimatedTime}</p>` : ''}
          <p style="margin-top: 20px; font-style: italic;">We appreciate your business!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generatePDF = async (order: Order): Promise<string> => {
  try {
    const html = generateInvoiceHTML(order);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
      width: 612,
      height: 792,
    });
    
    // Move to a more accessible location with a proper filename
    const fileName = `invoice-${order.id}.pdf`;
    const newUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.moveAsync({
      from: uri,
      to: newUri,
    });
    
    return newUri;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF invoice');
  }
};

export const shareViaWhatsApp = async (order: Order) => {
  try {
    const pdfUri = await generatePDF(order);
    const phoneNumber = order.customerPhone.replace(/[^\d]/g, '');
    
    // Format phone number for WhatsApp
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith('1') && phoneNumber.length === 10) {
      formattedPhone = '1' + phoneNumber;
    }
    
    if (Platform.OS === 'web') {
      // For web, we can't directly share to WhatsApp with file
      // So we'll download the PDF and let user share manually
      const response = await fetch(pdfUri);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      Alert.alert(
        'PDF Downloaded', 
        'Invoice PDF has been downloaded. You can now share it via WhatsApp manually.',
        [
          {
            text: 'Open WhatsApp Web',
            onPress: () => {
              const whatsappUrl = `https://wa.me/${formattedPhone}`;
              window.open(whatsappUrl, '_blank');
            }
          },
          { text: 'OK' }
        ]
      );
    } else {
      // For mobile, try to share the PDF file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Invoice PDF',
        });
      } else {
        throw new Error('Sharing not available');
      }
    }
  } catch (error) {
    console.error('WhatsApp PDF sharing error:', error);
    Alert.alert('Error', 'Failed to share PDF via WhatsApp. Please try the general share option.');
  }
};

export const shareViaEmail = async (order: Order) => {
  try {
    const pdfUri = await generatePDF(order);
    const subject = `Invoice #INV-${order.id} - Golden Crust Bakery`;
    const body = `Dear ${order.customerName},

Thank you for your order at Golden Crust Bakery!

Your order is ready for pickup. Please find the invoice attached.

Order Details:
- Invoice #: INV-${order.id}
- Total Amount: $${order.total.toFixed(2)}
- Delivery Date: ${order.deliveryDate.toLocaleDateString()}

We appreciate your business!

Best regards,
Golden Crust Bakery Team`;
    
    if (Platform.OS === 'web') {
      // For web, download the PDF and open email client
      const response = await fetch(pdfUri);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Open email client
      const mailtoUrl = `mailto:${order.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl);
      
      Alert.alert('PDF Downloaded', 'Invoice PDF downloaded. Email client opened - please attach the downloaded PDF.');
    } else {
      // For mobile, use mail composer with attachment
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: [order.customerEmail],
          subject: subject,
          body: body,
          attachments: [pdfUri],
        });
      } else {
        // Fallback to general sharing
        await shareInvoice(order);
      }
    }
  } catch (error) {
    console.error('Email PDF sharing error:', error);
    Alert.alert('Error', 'Failed to share PDF via email. Please try the general share option.');
  }
};

export const shareInvoice = async (order: Order) => {
  try {
    const pdfUri = await generatePDF(order);
    
    if (Platform.OS === 'web') {
      // For web, download the PDF
      const response = await fetch(pdfUri);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      Alert.alert('PDF Downloaded', 'Invoice PDF has been downloaded to your device.');
    } else {
      // For mobile, use the sharing API
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Invoice PDF',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device.');
      }
    }
  } catch (error) {
    console.error('General PDF sharing error:', error);
    Alert.alert('Error', 'Failed to generate or share PDF invoice. Please try again.');
  }
};

// Legacy text sharing functions (keeping as backup)
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
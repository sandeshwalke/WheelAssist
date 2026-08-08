package com.svs.wheel_assist.service.impli;

import com.svs.wheel_assist.entity.Invoice;
import com.svs.wheel_assist.entity.JobCard;
import com.svs.wheel_assist.entity.Part;
import com.svs.wheel_assist.entity.User;
import com.svs.wheel_assist.entity.Vehicle;
import com.svs.wheel_assist.entity.WorkOrder;
import com.svs.wheel_assist.repo.InvoiceRepository;
import com.svs.wheel_assist.repo.PartRepository;
import com.svs.wheel_assist.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final InvoiceRepository invoiceRepository;
    private final PartRepository partRepository;

    @Value("${spring.mail.username:wheelassist.service@gmail.com}")
    private String fromEmail;

    @Override
    @Async
    @Transactional(readOnly = true)
    public void sendInvoicePaidEmail(Long invoiceId) {
        try {
            Invoice invoice = invoiceRepository.findById(invoiceId).orElse(null);
            if (invoice == null) {
                log.warn("Cannot send invoice email: Invoice not found with id {}", invoiceId);
                return;
            }

            JobCard jobCard = invoice.getJobCard();
            if (jobCard == null) {
                log.warn("Cannot send invoice email: JobCard missing for invoice id {}", invoiceId);
                return;
            }

            WorkOrder workOrder = jobCard.getWorkorder();
            if (workOrder == null) {
                log.warn("Cannot send invoice email: Workorder missing for invoice id {}", invoiceId);
                return;
            }

            Vehicle vehicle = workOrder.getVehicle();
            if (vehicle == null || vehicle.getUser() == null) {
                log.warn("Cannot send invoice email: Vehicle or Owner missing for invoice id {}", invoiceId);
                return;
            }

            User customer = vehicle.getUser();
            String recipientEmail = customer.getEmail();
            if (recipientEmail == null || recipientEmail.isBlank()) {
                log.warn("Cannot send invoice email: Customer email is empty for user id {}", customer.getUserId());
                return;
            }

            List<Part> parts = partRepository.findByJobCardJobId(jobCard.getJobId());

            String htmlBody = buildHtmlInvoiceReceipt(invoice, jobCard, workOrder, vehicle, customer, parts);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(recipientEmail);
            helper.setSubject("TAX INVOICE #" + invoice.getInvoiceId() + " - WheelAssist Receipt (PAID)");
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Successfully sent paid tax invoice email for invoice #{} to {}", invoiceId, recipientEmail);

        } catch (Exception e) {
            log.warn("Failed to send paid tax invoice email for invoice #{}: {}", invoiceId, e.getMessage());
        }
    }

    private String buildHtmlInvoiceReceipt(
            Invoice invoice,
            JobCard jobCard,
            WorkOrder workOrder,
            Vehicle vehicle,
            User customer,
            List<Part> parts
    ) {
        String customerName = customer.getName() != null ? customer.getName() : "Valued Customer";
        String vehiclePlate = vehicle.getVehiclePlate() != null ? vehicle.getVehiclePlate() : "N/A";
        String mechanicName = workOrder.getMechanic() != null && workOrder.getMechanic().getUser() != null
                ? workOrder.getMechanic().getUser().getName() : "Service Specialist";

        String problemDesc = jobCard.getWorkDone() != null && !jobCard.getWorkDone().isBlank()
                ? jobCard.getWorkDone()
                : (workOrder.getProblemDescription() != null ? workOrder.getProblemDescription() : "Standard Service & Maintenance");
        String formattedDate = invoice.getInvoiceDate() != null
                ? invoice.getInvoiceDate().format(DateTimeFormatter.ofPattern("M/d/yyyy"))
                : "Today";

        BigDecimal partsSubtotal = invoice.getPartsCost() != null ? invoice.getPartsCost() : BigDecimal.ZERO;
        BigDecimal labourCharges = invoice.getLabourCost() != null ? invoice.getLabourCost() : BigDecimal.ZERO;
        BigDecimal gstAmount = invoice.getGst() != null ? invoice.getGst() : BigDecimal.ZERO;
        BigDecimal grandTotal = invoice.getTotalCost() != null ? invoice.getTotalCost() : BigDecimal.ZERO;

        StringBuilder partsTableRows = new StringBuilder();
        if (parts != null && !parts.isEmpty()) {
            for (Part part : parts) {
                BigDecimal unitPrice = part.getUnitPrice() != null ? part.getUnitPrice() : BigDecimal.ZERO;
                int qty = part.getQuantity() != null ? part.getQuantity() : 1;
                BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(qty));

                partsTableRows.append("<tr>")
                        .append("<td style=\"padding: 12px 16px; border-bottom: 1px solid #E5E7EB; color: #111827; font-weight: 500;\">")
                        .append(escapeHtml(part.getPartName())).append("</td>")
                        .append("<td style=\"padding: 12px 16px; border-bottom: 1px solid #E5E7EB; color: #4B5563; text-align: center;\">")
                        .append(qty).append("</td>")
                        .append("<td style=\"padding: 12px 16px; border-bottom: 1px solid #E5E7EB; color: #4B5563; text-align: right;\">&#8377;")
                        .append(String.format("%.2f", unitPrice)).append("</td>")
                        .append("<td style=\"padding: 12px 16px; border-bottom: 1px solid #E5E7EB; color: #111827; font-weight: 700; text-align: right;\">&#8377;")
                        .append(String.format("%.2f", totalPrice)).append("</td>")
                        .append("</tr>");
            }
        } else {
            partsTableRows.append("<tr><td colspan=\"4\" style=\"padding: 16px; text-align: center; color: #6B7280;\">No spare parts recorded</td></tr>");
        }

        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset=\"UTF-8\">"
                + "<title>Tax Invoice</title>"
                + "</head>"
                + "<body style=\"margin: 0; padding: 20px; background-color: #0F172A; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\">"
                + "<div style=\"max-width: 680px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);\">"
                
                // Header Banner
                + "<div style=\"background-color: #0F172A; padding: 24px 32px; color: #FFFFFF; display: flex; align-items: center; justify-content: space-between;\">"
                + "  <div>"
                + "    <div style=\"display: flex; align-items: center; gap: 10px;\">"
                + "      <div style=\"background-color: #EA580C; width: 36px; height: 36px; border-radius: 8px; display: inline-block; text-align: center; line-height: 36px; font-weight: bold;\">&#128196;</div>"
                + "      <h1 style=\"margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;\">TAX INVOICE #" + invoice.getInvoiceId() + "</h1>"
                + "    </div>"
                + "    <p style=\"margin: 4px 0 0 46px; font-size: 13px; color: #94A3B8;\">WheelAssist Authorized Service Network</p>"
                + "  </div>"
                + "</div>"

                // Info Cards Grid
                + "<div style=\"padding: 28px 32px 16px 32px;\">"
                + "  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px;\">"
                + "    <tr>"
                + "      <td width=\"33%\" style=\"vertical-align: top;\">"
                + "        <span style=\"font-size: 11px; font-weight: 700; color: #64748B; letter-spacing: 0.5px; text-transform: uppercase;\">BILLED TO</span>"
                + "        <h3 style=\"margin: 6px 0 2px 0; font-size: 16px; color: #0F172A;\">" + escapeHtml(customerName) + "</h3>"
                + "        <span style=\"font-size: 13px; color: #64748B;\">Plate: " + escapeHtml(vehiclePlate) + "</span>"
                + "      </td>"
                + "      <td width=\"33%\" style=\"vertical-align: top;\">"
                + "        <span style=\"font-size: 11px; font-weight: 700; color: #64748B; letter-spacing: 0.5px; text-transform: uppercase;\">SERVICE SPECIALIST</span>"
                + "        <h3 style=\"margin: 6px 0 2px 0; font-size: 16px; color: #EA580C;\">" + escapeHtml(mechanicName) + "</h3>"
                + "        <span style=\"font-size: 13px; color: #64748B;\">Work Order #" + workOrder.getWorkorderId() + "</span>"
                + "      </td>"
                + "      <td width=\"33%\" style=\"vertical-align: top; text-align: right;\">"
                + "        <span style=\"font-size: 11px; font-weight: 700; color: #64748B; letter-spacing: 0.5px; text-transform: uppercase;\">PAYMENT STATUS</span>"
                + "        <div style=\"margin-top: 6px;\">"
                + "          <span style=\"background-color: #F3E8FF; color: #7E22CE; font-weight: 700; font-size: 12px; padding: 4px 14px; border-radius: 9999px; display: inline-block;\">PAID</span>"
                + "        </div>"
                + "        <p style=\"margin: 6px 0 0 0; font-size: 12px; color: #64748B;\">" + formattedDate + "</p>"
                + "      </td>"
                + "    </tr>"
                + "  </table>"
                + "</div>"

                // Service Summary Section
                + "<div style=\"padding: 0 32px 20px 32px;\">"
                + "  <div style=\"display: flex; align-items: center; gap: 8px; margin-bottom: 10px;\">"
                + "    <span style=\"color: #EA580C; font-size: 16px;\">&#128295;</span>"
                + "    <h4 style=\"margin: 0; font-size: 15px; color: #0F172A;\">Service Summary &amp; Work Conducted</h4>"
                + "  </div>"
                + "  <div style=\"background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 18px; color: #334155; font-size: 14px; line-height: 1.5;\">"
                +      escapeHtml(problemDesc)
                + "  </div>"
                + "</div>"

                // Parts Table Section
                + "<div style=\"padding: 0 32px 24px 32px;\">"
                + "  <div style=\"display: flex; align-items: center; gap: 8px; margin-bottom: 10px;\">"
                + "    <span style=\"color: #EA580C; font-size: 16px;\">&#128230;</span>"
                + "    <h4 style=\"margin: 0; font-size: 15px; color: #0F172A;\">Spare Parts &amp; Replaced Components</h4>"
                + "  </div>"
                + "  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse: collapse; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; font-size: 14px;\">"
                + "    <thead>"
                + "      <tr style=\"background-color: #F1F5F9; color: #475569;\">"
                + "        <th style=\"padding: 10px 16px; text-align: left; font-weight: 600;\">Part Description</th>"
                + "        <th style=\"padding: 10px 16px; text-align: center; font-weight: 600;\">Qty</th>"
                + "        <th style=\"padding: 10px 16px; text-align: right; font-weight: 600;\">Unit Price</th>"
                + "        <th style=\"padding: 10px 16px; text-align: right; font-weight: 600;\">Line Total</th>"
                + "      </tr>"
                + "    </thead>"
                + "    <tbody>"
                +        partsTableRows.toString()
                + "    </tbody>"
                + "  </table>"
                + "</div>"

                // Financial Breakdown Box
                + "<div style=\"padding: 0 32px 32px 32px;\">"
                + "  <div style=\"background-color: #0F172A; border-radius: 10px; padding: 20px 24px; color: #FFFFFF;\">"
                + "    <table width=\"100%\" cellpadding=\"4\" cellspacing=\"0\" style=\"font-size: 14px;\">"
                + "      <tr>"
                + "        <td style=\"color: #94A3B8;\">Spare Parts Subtotal:</td>"
                + "        <td style=\"text-align: right; font-weight: 600; color: #E2E8F0;\">&#8377;" + String.format("%.2f", partsSubtotal) + "</td>"
                + "      </tr>"
                + "      <tr>"
                + "        <td style=\"color: #94A3B8;\">Labour &amp; Service Charges:</td>"
                + "        <td style=\"text-align: right; font-weight: 600; color: #E2E8F0;\">&#8377;" + String.format("%.2f", labourCharges) + "</td>"
                + "      </tr>"
                + "      <tr>"
                + "        <td style=\"color: #94A3B8;\">GST (18% Applicable Tax):</td>"
                + "        <td style=\"text-align: right; font-weight: 600; color: #E2E8F0;\">&#8377;" + String.format("%.2f", gstAmount) + "</td>"
                + "      </tr>"
                + "      <tr><td colspan=\"2\" style=\"padding-top: 12px; border-bottom: 1px solid #334155;\"></td></tr>"
                + "      <tr>"
                + "        <td style=\"padding-top: 12px; font-size: 18px; font-weight: 800;\">Grand Total Payable:</td>"
                + "        <td style=\"padding-top: 12px; text-align: right; font-size: 22px; font-weight: 800; color: #F97316;\">&#8377;" + String.format("%.2f", grandTotal) + "</td>"
                + "      </tr>"
                + "    </table>"
                + "  </div>"
                + "</div>"

                // Footer
                + "<div style=\"background-color: #F8FAFC; padding: 16px 32px; border-top: 1px solid #E2E8F0; text-align: center; color: #64748B; font-size: 12px;\">"
                + "  Thank you for choosing WheelAssist Authorized Service Network. Drive safe!"
                + "</div>"

                + "</div>"
                + "</body>"
                + "</html>";
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}

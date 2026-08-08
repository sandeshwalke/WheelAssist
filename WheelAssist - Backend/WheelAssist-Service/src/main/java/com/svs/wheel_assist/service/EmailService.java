package com.svs.wheel_assist.service;

public interface EmailService {

    /**
     * Sends a rich HTML Tax Invoice email to the customer after their invoice is marked as paid.
     *
     * @param invoiceId the ID of the paid invoice
     */
    void sendInvoicePaidEmail(Long invoiceId);
}

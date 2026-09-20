const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const { sequelize } = require('../config/db');

const create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { invoice_id, amount, method, reference_no, notes } = req.body;
    const invoice = await Invoice.findByPk(invoice_id, { include: [{ model: Payment, as: 'payments' }], transaction: t });
    if (!invoice) { await t.rollback(); return res.status(404).json({ message: 'Invoice not found.' }); }

    const payment = await Payment.create(
      { invoice_id, amount, method, reference_no, notes, recorded_by: req.user.id },
      { transaction: t }
    );

    const totalPaid = invoice.payments.reduce((s, p) => s + parseFloat(p.amount), 0) + parseFloat(amount);
    const invoiceTotal = parseFloat(invoice.total);
    const newStatus = totalPaid >= invoiceTotal ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
    await invoice.update({ status: newStatus }, { transaction: t });

    await t.commit();
    res.status(201).json({ payment, invoice_status: newStatus, total_paid: totalPaid, balance: Math.max(0, invoiceTotal - totalPaid) });
  } catch (err) { await t.rollback(); next(err); }
};

const getByInvoice = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({ where: { invoice_id: req.params.invoiceId }, order: [['paid_at', 'DESC']] });
    res.json(payments);
  } catch (err) { next(err); }
};

module.exports = { create, getByInvoice };

exports.spaceComplete = (text, length) => {
  if (!text) text = "";
  return text.length > length
    ? text.substring(0, length)
    : text + " ".repeat(length - text.length);
};

exports.zeroComplete = (num, length) => {
  const str = num.toString();
  return str.length > length
    ? str.substring(0, length)
    : "0".repeat(length - str.length) + str;
};

exports.generateHeader = (transfer) =>
  [
    "0302",
    transfer.DueDate.toISOString()
      .replace(/[-:T.Z]/g, "")
      .substring(0, 8),
    "000000",
    " ".repeat(12),
    this.spaceComplete("ATNER", 24),
    this.zeroComplete(transfer.idref, 6),
    this.spaceComplete(transfer.Reference, 20),
    " ".repeat(3),
    transfer.BankCode || "504",
    transfer.AccountNumber || "2121147161920003",
    " ".repeat(2),
    this.spaceComplete(transfer.CompanyCode || "ATNERSARL", 12),
    "01",
    transfer.CreatedAt.toISOString()
      .replace(/[-:T.Z]/g, "")
      .substring(0, 14),
    " ".repeat(17),
    transfer.BranchCode || "0018181002",
    " ".repeat(341),
  ].join("");

exports.generateBody = (items) =>
  items
    .map((item) =>
      [
        "0602",
        " ".repeat(8),
        "000000",
        " ".repeat(12),
        this.spaceComplete(`${item.LastName} ${item.FirstName}`, 24),
        this.spaceComplete(
          `${item.LastName} ${item.FirstName}`.substring(
            24,
            `${item.LastName} ${item.FirstName}`.length
          ),
          10
        ),
        " ".repeat(9),
        item.IdentityType || "1",
        this.spaceComplete(item.IdentityNumber, 12),
        "0".repeat(16),
        this.zeroComplete(Math.floor(item.Amount * 100), 16),
        " ",
        this.spaceComplete(item.TransferReference, 28),
        " ".repeat(2),
        "0".repeat(10),
        " ",
        this.spaceComplete(item.Address || "", 50),
        this.spaceComplete(item.City || "", 30),
        this.spaceComplete(item.PostalCode || "", 5),
        this.spaceComplete(item.Email || "", 70),
        this.spaceComplete(item.Phone || "", 15),
        "01",
        " ".repeat(168),
      ].join("")
    )
    .join("\r\n");

exports.generateFooter = (data) =>
  [
    "0802",
    " ".repeat(8),
    "000000",
    " ".repeat(84),
    this.zeroComplete(Math.floor(data.TotalAmount * 100), 16),
    this.zeroComplete(data.BeneficiaryCount, 10),
    " ".repeat(372),
  ].join("");

exports.formatDateTime = () => {
  const now = new Date();

  const pad = (n) => n.toString().padStart(2, "0");

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1); // Months are 0-based
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

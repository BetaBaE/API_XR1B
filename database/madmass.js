exports.transfers = {
  getAll: `SELECT * FROM DAF_MassTransfers WHERE 1=1`,
  getCount: `SELECT COUNT(*) AS count FROM DAF_MassTransfers WHERE 1=1`,
  create: `INSERT INTO DAF_MassTransfers 
  (Reference, Description, DueDate, CreatedBy, BankCode, AccountNumber, CompanyCode, BranchCode) 
  VALUES 
  (@Reference, @Description, @DueDate, @CreatedBy, @BankCode, @AccountNumber, @CompanyCode, @BranchCode)`,
  getById: `SELECT * FROM DAF_MassTransfers WHERE Id = @Id`,
  update: `UPDATE DAF_MassTransfers SET Description = @Description, DueDate = @DueDate, Status = @Status, BankCode = @BankCode, AccountNumber = @AccountNumber, CompanyCode = @CompanyCode, BranchCode = @BranchCode WHERE Id = @Id`,
  delete: `DELETE FROM DAF_MassTransfers WHERE Id = @Id`,
  getHeaderData: `SELECT id%999999 as idref,* FROM DAF_MassTransfers WHERE Id = @MassTransferId`,
  markAsGenerated: `UPDATE DAF_MassTransfers SET Status = 'Générer', FileGeneratedAt = GETDATE(), FilePath = @FilePath WHERE Id = @MassTransferId`,
  getTransferCanPrint: `select * 
                        from [dbo].[DAF_MassTransfers]
                        where [TotalAmount]>0 and [BeneficiaryCount]>0 and status in ('Saisie', 'Générer')  
                        order by CreatedAt DESC
                        `,
};

exports.beneficiaries = {
  getAll: `SELECT * FROM DAF_Beneficiaries WHERE 1=1`,
  getCount: `SELECT COUNT(*) AS count FROM DAF_Beneficiaries`,
  create: `INSERT INTO DAF_Beneficiaries (LastName, FirstName, IdentityType, IdentityNumber, Address, City, PostalCode, Email, Phone,  CreatedBy) OUTPUT INSERTED.Id VALUES (@LastName, @FirstName, @IdentityType, @IdentityNumber, @Address, @City, @PostalCode, @Email, @Phone,  @CreatedBy)`,
  getById: `SELECT * FROM DAF_Beneficiaries WHERE Id = @Id`,
  update: `UPDATE DAF_Beneficiaries SET LastName = @LastName, FirstName = @FirstName, IdentityType = @IdentityType, IdentityNumber = @IdentityNumber, Address = @Address, City = @City, PostalCode = @PostalCode, Email = @Email, Phone = @Phone WHERE Id = @Id`,
  getBeneficiariesNotInTransfer: `
 SELECT id
       ,Concat([LastName],' ',[FirstName] ,' (',[IdentityNumber],')') name
  FROM [DAF_Beneficiaries] 
  where id not in (select beneficiaryid 
						from [dbo].[DAF_MassTransferItems] where massTransferId = @massTransferId)`,
};

exports.transferItems = {
  getAll: `SELECT * FROM DAF_MassTransferItems WHERE 1=1`,
  getCount: `SELECT COUNT(*) AS count FROM DAF_MassTransferItems  WHERE 1=1`,
  add: `INSERT INTO DAF_MassTransferItems (MassTransferId, BeneficiaryId, Amount, TransferReference) VALUES (@MassTransferId, @BeneficiaryId, @Amount, @TransferReference)`,
  remove: `DELETE FROM DAF_MassTransferItems WHERE MassTransferId = @MassTransferId AND BeneficiaryId = @BeneficiaryId`,
  getByTransfer: `SELECT mti.*, b.LastName, b.FirstName FROM DAF_MassTransferItems mti JOIN DAF_Beneficiaries b ON mti.BeneficiaryId = b.Id WHERE mti.MassTransferId = @MassTransferId`,
  getBodyData: `SELECT b.*, mti.Amount, mti.TransferReference FROM DAF_MassTransferItems mti JOIN DAF_Beneficiaries b ON mti.BeneficiaryId = b.Id WHERE mti.MassTransferId = @MassTransferId ORDER BY mti.TransferReference`,
  getTheRefrence: `SELECT STUFF(Reference, 1, 3, '') id ,count(t.massTransferId) +1 count
                from [dbo].[DAF_MassTransfers] m left join [DAF_MassTransferItems] t on m.id = t.massTransferId
                where m.id = @massTransferId
                group by Reference`,
  getOneById: `
    SELECT mti.id, CONCAT(b.LastName, ' ', b.FirstName) as fullname,b.IdentityNumber, mti.Amount,mti.TransferReference,mt.Reference,mt.Status
    FROM DAF_MassTransferItems mti 
    left join DAF_MassTransfers mt on mti.MassTransferId = mt.id
    left join DAF_Beneficiaries b on b.id = mti.BeneficiaryId
    WHERE mti.Id = @Id`,

  update: `
    UPDATE mti 
    SET mti.Amount = @Amount 
    from DAF_MassTransferItems mti left join DAF_MassTransfers mt on mti.MassTransferId = mt.id
    WHERE mti.id = @id and mt.Status in ('Saisie')`,
};

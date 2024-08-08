// Exportations pour AttestationFiscalite
exports.AttestationFiscalite = {
  // Requête SQL pour récupérer toutes les attestations ainsi que les détails des fournisseurs associés
  getAllAttestation: `
    SELECT att.id as id, nom, fou.id as idfournisseur,
           [dateDebut],
           [dateExpiration]
    FROM [DAF_AttestationFiscal] Att
    INNER JOIN DAF_FOURNISSEURS fou ON Att.idfournisseur = fou.id
    WHERE 1=1
  `,

  // Requête SQL pour obtenir le nombre total d'attestations
  getAllAttestationCount: `
    SELECT COUNT(*) as count
    FROM [dbo].[DAF_AttestationFiscal]
  `,

  // Requête SQL pour créer une nouvelle attestation
  create: `
    INSERT INTO [dbo].[DAF_AttestationFiscal] (
      [idfournisseur],
      [numAttestation],
      [dateDebut],
      [dateExpiration],
      [redacteur]
    )
    VALUES (
      @idfournisseur,
      @numAttestation,
      @dateDebut,
      DATEADD(MONTH, 6, @dateDebut), -- Définit automatiquement la date d'expiration à 6 mois à partir de la date de début
      @redacteur
    );
  `,
};

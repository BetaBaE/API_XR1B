// Exportations pour AttestationFiscalite
exports.AttestationFiscalite = {
  // Requête SQL pour récupérer toutes les attestations ainsi que les détails des fournisseurs associés
  getAllAttestation: `
        SELECT 
        COALESCE(CAST(att.id AS VARCHAR), fou.nom) as id,  -- Nom si pas d'attestation, sinon ID de l'attestation
        fou.nom, 
        fou.id as idfournisseur,
        att.[dateDebut],
        att.[dateExpiration],
        CASE 
            WHEN att.[dateExpiration] IS NULL 
                THEN NULL
            ELSE DATEDIFF(DAY, GETDATE(), att.[dateExpiration])
        END AS joursRestants,
        CASE 
            WHEN att.[dateExpiration] IS NULL 
                THEN 'Pas d''attestation fiscale'
            WHEN DATEDIFF(DAY, GETDATE(), att.[dateExpiration]) > 0 
                THEN CAST(DATEDIFF(DAY, GETDATE(), att.[dateExpiration]) AS VARCHAR) + ' jours restants'
            WHEN DATEDIFF(DAY, GETDATE(), att.[dateExpiration]) = 0 
                THEN 'Expire aujourd''hui'
            ELSE CAST(ABS(DATEDIFF(DAY, GETDATE(), att.[dateExpiration])) AS VARCHAR) + ' jours de retard'
        END AS statut,
        CASE 
            WHEN att.[dateExpiration] IS NULL THEN 1  -- Priorité 1 : Pas d'attestation (CRITIQUE)
            WHEN DATEDIFF(DAY, GETDATE(), att.[dateExpiration]) < 0 THEN 2  -- Priorité 2 : Expirée
            WHEN DATEDIFF(DAY, GETDATE(), att.[dateExpiration]) = 0 THEN 3  -- Priorité 3 : Expire aujourd'hui
            WHEN DATEDIFF(DAY, GETDATE(), att.[dateExpiration]) <= 20 THEN 4 -- Priorité 4 : Alerte (expire bientôt)
            ELSE 5 -- Priorité 5 : OK
        END AS priorite
    FROM DAF_FOURNISSEURS fou
    LEFT JOIN (
        SELECT 
            att.id,
            att.idfournisseur,
            att.[dateDebut],
            att.[dateExpiration]
        FROM [DAF_AttestationFiscal] att
        INNER JOIN (
            SELECT idfournisseur, MAX(dateExpiration) AS derniere_expiration
            FROM [DAF_AttestationFiscal]
            GROUP BY idfournisseur
        ) AS derniere_att ON att.idfournisseur = derniere_att.idfournisseur 
                          AND att.dateExpiration = derniere_att.derniere_expiration
    ) att ON att.idfournisseur = fou.id
    WHERE 1=1 
        AND fou.actif = 'Oui'
        AND fou.id IN (
            SELECT idfournisseur 
            FROM daf_factureSaisie 
            WHERE etat = 'Saisie'
        )
-- ORDER BY priorite ASC, att.[dateExpiration] ASC
  `,

  // Requête SQL pour obtenir le nombre total d'attestations
  getAllAttestationCount: `
    SELECT COUNT(*) as count
FROM DAF_FOURNISSEURS fou
LEFT JOIN (
    SELECT 
        att.id,
        att.idfournisseur,
        att.[dateDebut],
        att.[dateExpiration]
    FROM [DAF_AttestationFiscal] att
    INNER JOIN (
        SELECT idfournisseur, MAX(dateExpiration) AS derniere_expiration
        FROM [DAF_AttestationFiscal]
        GROUP BY idfournisseur
    ) AS derniere_att ON att.idfournisseur = derniere_att.idfournisseur 
                      AND att.dateExpiration = derniere_att.derniere_expiration
) att ON att.idfournisseur = fou.id
WHERE 1=1 
    AND fou.actif = 'Oui'
    AND fou.id IN (
        SELECT idfournisseur 
        FROM daf_factureSaisie 
        WHERE etat = 'Saisie'
    )
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

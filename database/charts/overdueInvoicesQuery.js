exports.overdueInvoicesQuery = {
  query: `
WITH antecedent AS (
    SELECT 
        SUM(CASE WHEN Etat = 'Saisie' THEN TTC - AcompteVal ELSE 0 END) AS montantSaisie,
        SUM(CASE WHEN Etat = 'En cours' THEN TTC - AcompteVal ELSE 0 END) AS montantEnCours
    FROM DAF_FactureSaisie
    WHERE 
        DATEADD(day, 60, DateFacture) <= GETDATE()  -- 60 days overdue
),
unMois AS (
    SELECT 
        SUM(CASE WHEN Etat = 'Saisie' THEN TTC - AcompteVal ELSE 0 END) AS montantSaisie,
        SUM(CASE WHEN Etat = 'En cours' THEN TTC - AcompteVal ELSE 0 END) AS montantEnCours
    FROM DAF_FactureSaisie
    WHERE 
        DATEADD(day, 60, DateFacture) > GETDATE() AND  -- 60 days due date > today
        DATEADD(day, 60, DateFacture) <= DATEADD(day, 30, GETDATE())  -- 60 days due date <= today + 30 days
),
deuxMois AS (
    SELECT 
        SUM(CASE WHEN Etat = 'Saisie' THEN TTC - AcompteVal ELSE 0 END) AS montantSaisie,
        SUM(CASE WHEN Etat = 'En cours' THEN TTC - AcompteVal ELSE 0 END) AS montantEnCours
    FROM DAF_FactureSaisie
    WHERE 
        DATEADD(day, 60, DateFacture) > DATEADD(day, 30, GETDATE()) AND
        DATEADD(day, 60, DateFacture) <= DATEADD(day, 60, GETDATE())
)

SELECT * FROM (
    SELECT 
        'Antecedent' AS id,
        'Echu' AS name,
        a.montantSaisie,
        a.montantEnCours
    FROM antecedent a
    UNION ALL
    SELECT 
        'UnMois' AS id,
        'Un mois' AS name,
        u.montantSaisie,
        u.montantEnCours
    FROM unMois u
    UNION ALL  
    SELECT 
        'DeuxMois' AS id,
        'Deux mois' AS name,
        d.montantSaisie,
        d.montantEnCours
    FROM deuxMois d
    UNION ALL  
    SELECT 
        'Total' AS id,
        'Total' AS name,
        a.montantSaisie + u.montantSaisie + d.montantSaisie AS montantSaisie,
        a.montantEnCours + u.montantEnCours + d.montantEnCours AS montantEnCours
    FROM antecedent a, unMois u, deuxMois d
) t
ORDER BY montantSaisie DESC, montantEnCours DESC;

`,
};

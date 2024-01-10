const { getConnection, getSql } = require("../database/connection");
const { SuivieFacture } = require("../database/querys");
exports.getallCountexport = async (req, res) => {
    try {
      const pool = await getConnection();
      const result = await pool.request().query(SuivieFacture.getSuivieFacturecount);
      const count = result.recordset[0].count; 
      res.status(200).json({ count }); 
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: error.message }); 
    }
  };
  exports.getSuivieFactureCount = async(req, res, next) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(SuivieFacture.getSuivieFacturecount);
        req.count = result.recordset[0].count;
        next();
    } catch (error) {
        res.status(500);
        console.log(error.message);
        res.send(error.message);
    }
  };
exports.getSuivieFacture = async(req, res) => {
    try {
        let range = req.query.range || "[0,9]";
        let sort = req.query.sort || '["id" , "DESC"]';
        let filter = req.query.filter || "{}";
        range = JSON.parse(range);
        sort = JSON.parse(sort);
        filter = JSON.parse(filter);
        console.log(filter);
        let queryFilter = "";
        if (filter.chantier) {
            queryFilter += `and upper(chantier) like(upper('%${filter.chantier}%'))`;
        }
        if (filter.BonCommande) {
            queryFilter += `and upper(BonCommande) like(upper('%${filter.BonCommande}%'))`;
        }
        if (filter.designation) {
            queryFilter += `and upper(designation) like(upper('%${filter.designation}%'))`;
        }
        if (filter.DateFactureMin) {
            queryFilter += ` and DateFacture > '${filter.DateFactureMin}'`;
        }
        if (filter.DateFacturemax) {
            queryFilter += ` and DateFacture < '${filter.DateFacturemax}'`;
        }
        if (filter.DateFacturemax && filter.dateOperationMin) {
            queryFilter += ` and dateOperation between '${filter.dateOperationMin}' and  '${filter.DateFacturemax}' `;
        }
        if (filter.numerofacture) {
            queryFilter += `and upper(numeroFacture) like(upper('%${filter.numerofacture}%'))`;
        }
        if (filter.CodeFournisseur) {
            queryFilter += `and upper(CodeFournisseur) like(upper('%${filter.CodeFournisseur}%'))`;
        }
        if (filter.fournisseur) {
            queryFilter += `and upper(nom) like(upper('%${filter.fournisseur}%'))`;
        }
        if (filter.modepaiement) {
          
            queryFilter += ` and modepaiement = '${filter.modepaiement}'`
        }
        if (filter.ficheNavette) {
            queryFilter += `and upper(ficheNavette) like(upper('%${filter.ficheNavette}%'))`;
        }
        if (filter.dateExecutiondebut) {
            queryFilter += ` and dateExecution > '${filter.dateExecutiondebut}'`;
        }
        if (filter.Dateexecusionfin) {
            queryFilter += ` and dateExecution < '${filter.Dateexecusionfin}'`;
        }
        if (filter.DateFacturemax && filter.dateExecutiondebut) {
            queryFilter += ` and dateExecution between '${filter.dateExecutiondebut}' and  '${filter.DateFacturemax}' `;
        }
        if (filter.banque) {
            queryFilter += ` and  upper(banque) like(upper('%${filter.banque}%'))`;
        }
        if (filter.etat) {
            queryFilter += ` and etat = '${filter.etat}'`
        }

        if (filter.numerocheque) {
            queryFilter += ` and numerocheque = '${filter.numerocheque}'`
        }
        if (filter.ModePaiementID) {
            queryFilter += ` and ModePaiementID = '${filter.ModePaiementID}'`
        }
      
        console.log(queryFilter);
        const pool = await getConnection();
        const result = await pool.request().query(
            `${SuivieFacture.getSuivieFacture} ${queryFilter} Order by ${sort[0]} ${sort[1]}
              OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
        );
        console.log(req.count);
        res.set(
            "Content-Range",
            `SuivieFacture ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
        );
        res.json(result.recordset);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};





exports.getSuivieFactureCountEchu = async(req, res, next) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(SuivieFacture.getSuivieFactureEchucount);
        req.count = result.recordset[0].count;
        next();
    } catch (error) {
        res.status(500);
        console.log(error.message);
        res.send(error.message);
    }
  };
  
  exports.getSuivieFactureEchu= async(req, res) => {
      try {
          let range = req.query.range || "[0,9]";
          let sort = req.query.sort || '["id" , "DESC"]';
          let filter = req.query.filter || "{}";
          range = JSON.parse(range);
          sort = JSON.parse(sort);
          filter = JSON.parse(filter);
          console.log(filter);
          let queryFilter = "";
          if (filter.chantier) {
              queryFilter += `and upper(chantier) like(upper('%${filter.chantier}%'))`;
          }
          if (filter.BonCommande) {
              queryFilter += `and upper(BonCommande) like(upper('%${filter.BonCommande}%'))`;
          }
          if (filter.designation) {
              queryFilter += `and upper(designation) like(upper('%${filter.designation}%'))`;
          }
          if (filter.DateFactureMin) {
              queryFilter += ` and DateFacture > '${filter.DateFactureMin}'`;
          }
          if (filter.DateFacturemax) {
              queryFilter += ` and DateFacture < '${filter.DateFacturemax}'`;
          }
          if (filter.DateFacturemax && filter.dateOperationMin) {
              queryFilter += ` and dateOperation between '${filter.dateOperationMin}' and  '${filter.DateFacturemax}' `;
          }
          if (filter.numerofacture) {
              queryFilter += `and upper(numeroFacture) like(upper('%${filter.numerofacture}%'))`;
          }
          if (filter.CodeFournisseur) {
              queryFilter += `and upper(CodeFournisseur) like(upper('%${filter.CodeFournisseur}%'))`;
          }
          if (filter.fournisseur) {
              queryFilter += `and upper(nom) like(upper('%${filter.fournisseur}%'))`;
          }
          if (filter.modepaiement) {
            
              queryFilter += ` and modepaiement = '${filter.modepaiement}'`
          }
          if (filter.ficheNavette) {
              queryFilter += `and upper(ficheNavette) like(upper('%${filter.ficheNavette}%'))`;
          }
          if (filter.dateExecutiondebut) {
              queryFilter += ` and dateExecution > '${filter.dateExecutiondebut}'`;
          }
          if (filter.Dateexecusionfin) {
              queryFilter += ` and dateExecution < '${filter.Dateexecusionfin}'`;
          }
          if (filter.DateFacturemax && filter.dateExecutiondebut) {
              queryFilter += ` and dateExecution between '${filter.dateExecutiondebut}' and  '${filter.DateFacturemax}' `;
          }
          if (filter.banque) {
              queryFilter += ` and  upper(banque) like(upper('%${filter.banque}%'))`;
          }
          if (filter.etat) {
              queryFilter += ` and etat = '${filter.etat}'`
          }
  
          if (filter.numerocheque) {
              queryFilter += ` and numerocheque = '${filter.numerocheque}'`
          }
          if (filter.DateEcheancePaiement) {
            queryFilter += ` and DateEcheancePaiement = '${filter.DateEcheancePaiement}'`;
        }
          console.log(queryFilter);
          const pool = await getConnection();
          const result = await pool.request().query(
              `${SuivieFacture.getSuivieFactureEchu} ${queryFilter} Order by ${sort[0]} ${sort[1]}
                OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
          );
          console.log(req.count);
          res.set(
              "Content-Range",
              `SuivieFactureEchu ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
          );
          res.json(result.recordset);
      } catch (error) {
          res.status(500);
          res.send(error.message);
      }
  };
  exports.getSuivieFactureNonPayeCount = async (req, res, next) => {
    try {
        let filter = req.query.filter || "{}";
        const pool = await getConnection();
        const result = await pool.request().query(SuivieFacture.getSuivieFactureNonPayéCount);
        filter = JSON.parse(filter);
        console.log(filter);
        let queryFilter = "";
        if (filter.annee) {
            queryFilter += ` AND (YEAR(DateFacture) <= '${filter.annee}')`;
        }

        req.count = result.recordset[0].count;
        next();
    } catch (error) {
        res.status(500);
        console.log(error.message);
        res.send(error.message);
    }
};






exports.getSuivieFactureNonPayé = async(req, res) => {
    try {
        let range = req.query.range || "[0,9]";
        let sort = req.query.sort || '["id" , "DESC"]';
        let filter = req.query.filter || "{}";
        range = JSON.parse(range);
        sort = JSON.parse(sort);
        filter = JSON.parse(filter);
    
        let queryFilter = "";
        if (filter.annee) {
           // queryFilter += `AND (YEAR(DateFacture) <= '')
           queryFilter+=`
           AND (
            YEAR(DateFacture) = ${filter.annee}
            OR
            (YEAR(DateFacture) = ${filter.annee} - 1 AND Etat IN ('pas encore', 'En cours'))
        )
           `
        }
        if (filter.fournisseur) {
            queryFilter += ` and nom like('%${filter.fournisseur}%')`;
        }
        
     if (filter.chantier) {
                queryFilter += ` and chantier like('%${filter.chantier}%')`;
            }
            if (filter.etat) {
                queryFilter += ` and etat like('%${filter.etat}%')`;
            }
        console.log(queryFilter);
        const pool = await getConnection();
        const result = await pool.request().query(
            `${SuivieFacture.getSuivieFactureNonPayé} ${queryFilter} Order by ${sort[0]} ${sort[1]}
              OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
        );
        console.log(req.count);
        res.set(
            "Content-Range",
            `SuivieFactureNonPayé ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
        );
        res.json(result.recordset);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};
exports.getAnneeFacture = async (req, res) => {
    try {
    
      const pool = await getConnection();

      const result = await pool.request().query(
        `${SuivieFacture.getAnneSuivieFacture}`
      );
    

      res.set(
        "Content-Range",
        `SuivieFacture`
      );
  
      res.json(result.recordset);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };

      
  












const { getConnection, getSql } = require("../database/connection");
const { all } = require("../database/querys");


exports.getallCount = async(req, res, next) => {
  try {
      const pool = await getConnection();
      const result = await pool.request().query(all.getAllcount);
      req.count = result.recordset[0].count;
      next();
  } catch (error) {
      res.status(500);
      console.log(error.message);
      res.send(error.message);
  }
};

exports.getall = async(req, res) => {
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
        console.log(queryFilter);
        const pool = await getConnection();
        const result = await pool.request().query(
            `${all.getAll} ${queryFilter} Order by ${sort[0]} ${sort[1]}
              OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
        );
        console.log(req.count);
        res.set(
            "Content-Range",
            `facturesresptionne ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
        );
        res.json(result.recordset);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};





exports.getallCountechu = async(req, res, next) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(all.getgetfactureechucout);
        req.count = result.recordset[0].count;
        next();
    } catch (error) {
        res.status(500);
        console.log(error.message);
        res.send(error.message);
    }
  };
  
  exports.getallechu= async(req, res) => {
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
          console.log(queryFilter);
          const pool = await getConnection();
          const result = await pool.request().query(
              `${all.getfactureechu} ${queryFilter} Order by ${sort[0]} ${sort[1]}
                OFFSET ${range[0]} ROWS FETCH NEXT ${range[1] + 1 - range[0]} ROWS ONLY`
          );
          console.log(req.count);
          res.set(
              "Content-Range",
              `facturesresptionne ${range[0]}-${range[1] + 1 - range[0]}/${req.count}`
          );
          res.json(result.recordset);
      } catch (error) {
          res.status(500);
          res.send(error.message);
      }
  };














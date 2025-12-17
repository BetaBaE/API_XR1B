const express = require("express");
const { 
  getAllCards, 
  getCardCount, 
  createCard, 
  getCardById, 
  updateCard,
  getCardPrintData,
  getCardsEnCours
} = require("../controllers/Card");

const router = express.Router();

// GET all cards with count
router.get("/card", getCardCount, getAllCards);

// GET single card by ID
router.get("/card/:id", getCardById);

// POST create new card
router.post("/card", createCard);

// PUT update card by ID
router.put("/card/:id", updateCard);

// GET card print data
router.get("/card/:id/print", getCardPrintData);

// GET cards en cours
router.get("/card/encours/list", getCardsEnCours);

module.exports = router;
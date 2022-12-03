const express = require("express");
const router = express.Router();

//CONTROLLER IMPORTS
const {newTutorial, getAllTutorials, getLastTutorials,getTutorialBySlug,deleteTutorialById} = require("../controllers/tutorialController");
const authController = require("../controllers/authController")
//

router.route("/newTutorial").post(authController.protectRoute,newTutorial);
router.route("/").get(getAllTutorials)
router.route("/lastTutorials").get(getLastTutorials);
router.route("/:slug").get(authController.protectRoute,authController.restrictTo(['admin']),getTutorialBySlug);
router.route("/deleteTutorial/:id").delete(deleteTutorialById);

module.exports = router;
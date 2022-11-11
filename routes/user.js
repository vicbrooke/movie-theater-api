const { Router } = require("express");
const { User, Show } = require("../models");
const userRouter = Router();
const { getSingleUser } = require("../middleware/helper-functions");
const { body, validationResult } = require("express-validator");

// GET all users
// send 302 found status if successful
userRouter.get("/", async (req, res) => {
  const allUsers = await User.findAll();
  res.status(302).send(allUsers);
});

// GET one user - using an endpoint
// send 302 found status if successful
// if user does not exist, return 404 not found status
userRouter.get("/:id", getSingleUser, async (req, res) => {
  const { singleUser } = req;
  if (!singleUser) {
    res.status(404).send("User not found");
  } else {
    res.status(302).send(singleUser);
  }
});

// GET all shows watched by one user
// send 202 accepted status if successful
// if user does not exist, return 404 not found status
// if user has no watched shows, return 404 not found status
userRouter.get("/:id/shows", getSingleUser, async (req, res) => {
  const { singleUser } = req;
  if (!singleUser) {
    return res.status(404).send("User not found");
  } else {
    const singleUserShows = await singleUser.getShows({
      where: { status: "watched" },
    });
    if (singleUserShows.length === 0) {
      res.status(404).send(`No shows found for ${singleUser.username}`);
    } else {
      res.status(202).send(singleUserShows);
    }
  }
});

// PUT update and add a show if a user has watched it
// send 202 accepted status if successful
// if user does not exist, return 404 not found status
// if show does not exist, return 404 not found status
userRouter.put(
  "/:id/shows/:showId",
  // Server side validation to check that rating input is a number
  body("rating").matches(/\d/).withMessage("Rating must be a number"),
  body("status")
    .isLength({ min: 5, max: 25 })
    .withMessage("Status must be between 5 and 25 characters")
    .matches(/^[a-zA-Z-]+$/)
    .withMessage("Status can only contain letters"),
  getSingleUser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    const { singleUser } = req;
    const showToUpdate = await Show.findByPk(req.params.showId);
    if (!singleUser || !showToUpdate) {
      return res.status(404).send("Not found");
    }
    const updatedShow = await showToUpdate.update(req.body, {
      where: {
        id: req.params.showId,
      },
    });
    if (updatedShow.status === "watched") {
      await singleUser.addShow(updatedShow);
    }
    res.status(202).send(updatedShow);
  }
);

module.exports = userRouter;

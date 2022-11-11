const { Router } = require("express");
const { User, Show } = require("../models");
const userRouter = Router();
const { getSingleUser } = require("../middleware/helper-functions");

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

  getSingleUser,
  async (req, res) => {
    const { singleUser } = req;
    const showToUpdate = await Show.findByPk(req.params.showId);
    if (!singleUser || !showToUpdate) {
      return res.status(404).send("Not found");
    }
    const updatedShow = await showToUpdate.update(
      { status: "watched" },
      {
        where: {
          id: req.params.showId,
        },
      }
    );
    await singleUser.addShow(updatedShow);
    res.status(202).send(updatedShow);
  }
);

module.exports = userRouter;

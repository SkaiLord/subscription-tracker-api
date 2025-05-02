import Subscription from "../models/subscription.model.js";
import { workflowClient } from "../config/upstash.js";
import { SERVER_URL } from "../config/env.js";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    res
      .status(201)
      .json({ success: true, data: { subscription, workflowRunId } });
  } catch (e) {
    next(e);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if the user is the same as the one in the token
    if (req.user.id !== req.params.id) {
      const error = new Error("You are not the owner of this account");
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};

export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find();

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }

    // Check if the user is the same as the one in the token
    if (req.user.id !== subscription.user.toString()) {
      const error = new Error("You are not the owner of this account");
      error.status = 401;
      throw error;
    }

    Object.assign(subscription, req.body);

    await subscription.save();

    res.status(200).json({ success: true, data: subscription });
  } catch (e) {
    next(e);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }

    // Check if the user is the same as the one in the token
    if (req.user.id !== subscription.user.toString()) {
      const error = new Error("You are not the owner of this account");
      error.status = 401;
      throw error;
    }

    await subscription.deleteOne();

    res.status(200).json({ success: true, message: "Subscription deleted" });
  } catch (e) {
    next(e);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }

    // Check if the user is the same as the one in the token
    if (req.user.id !== subscription.user.toString()) {
      const error = new Error("You are not the owner of this account");
      error.status = 401;
      throw error;
    }

    subscription.status = "cancelled";

    await subscription.save();

    res.status(200).json({ success: true, data: subscription });
  } catch (e) {
    next(e);
  }
};

export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({
      renewalDate: { $gte: new Date() },
    });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};

export const getSubscriptionBySearch = async (req, res, next) => {
  try {
    const { q } = req.query;

    const subscriptions = await Subscription.find({
      $text: { $search: q },
    });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};

export const getSubscriptionByCategory = async (req, res, next) => {
  try {
    const { category } = req.query;

    const subscriptions = await Subscription.find({
      category: { $regex: category, $options: "i" },
    });
    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};

export const getSubscriptionByStatus = async (req, res, next) => {
  try {
    const { status } = req.query;

    const subscriptions = await Subscription.find({
      status: { $regex: status, $options: "i" },
    });
    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};

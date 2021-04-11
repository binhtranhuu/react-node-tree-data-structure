import express from "express";
import Category from "../models/categoryModel.js";
import { slugify } from "../utils.js";

const router = express.Router();

// router.get("/", async (req, res) => {
//   const listCategories = await Category.find({});
//   res.send(listCategories);
// });

const buildAncestors = async (id, parent_id) => {
  let ancest = [];
  try {
    let parent_category = await Category.findOne(
      { _id: parent_id },
      { name: 1, slug: 1, ancestors: 1 }
    ).exec();
    if (parent_category) {
      const { _id, name, slug } = parent_category;
      const ancest = [...parent_category.ancestors];
      ancest.unshift({ _id, name, slug });
      const category = await Category.findByIdAndUpdate(id, {
        $set: { ancestors: ancest },
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

const buildHierarchyAncestors = async (category_id, parent_id) => {
  if (category_id && parent_id) buildAncestors(category_id, parent_id);
  const result = await Category.find({ parent: category_id }).exec();
  if (result)
    result.forEach((doc) => {
      buildHierarchyAncestors(doc._id, category_id);
    });
};

router.post("/update-ancestry", async (req, res) => {
  const { category_id, new_parent_id } = req.body;
  try {
    const category = await Category.findByIdAndUpdate(category_id, {
      $set: { parent: new_parent_id },
    });
    buildHierarchyAncestors(category._id, new_parent_id);
    res.send({ message: "Success" });
  } catch (error) {
    console.log(error);
  }
});

router.post("/", async (req, res) => {
  let slug = slugify(req.body.name);
  let parent = req.body.parent ? req.body.parent : null;
  const category = new Category({ name: req.body.name, slug, parent });
  try {
    let newCategory = await category.save();
    buildAncestors(newCategory._id, parent);
    res.status(201).send({ response: `Category ${newCategory._id}` });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/rename", async (req, res) => {
  const { category_id, category_name } = req.body;
  try {
    await Category.findByIdAndUpdate(category_id, {
      $set: { name: category_name, slug: slugify(category_name) },
    });
    await Category.updateMany(
      { "ancestors._id": category_id },
      {
        $set: {
          "ancestors.$.name": category_name,
          "ancestors.$.slug": slugify(category_name),
        },
      },
      { multi: true }
    );
    res.status(200).send({ message: "Success" });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await Category.find({ slug: req.query.slug })
      .select({
        _id: false,
        name: true,
        "ancestors.slug": true,
        "ancestors.name": true,
      })
      .exec();
    res.status(201).send({ status: "success", result: result });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/get-all", async (req, res) => {
  try {
    const result = await Category.find({}, { _id: 1, name: 1, parent: 1 });
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/descendants", async (req, res) => {
  try {
    const result = await Category.find({
      "ancestors._id": req.query.category_id,
    })
      .select({ _id: false, name: true })
      .exec();
    res.status(201).send({ status: "success", result: result });
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;

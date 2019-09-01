const models = require('../models')
const constants = require('../constants')
const ObjectId = require('bson').ObjectId

module.exports = {
    getArticleList: async (req, res) => {
        const articles = await models.Article.find()
        for (let i = 0; i < articles.length; i++) {
            const article = articles[i]
            article.tasks = await models.Task.find({ articleId: article._id })
        }
        res.json({
            status: 'ok',
            data: articles
        })
    },
    getArticle: async (req, res) => {
        const article = await models.Article.findOne({ _id: ObjectId(req.params.id) })
        article.tasks = await models.Task.find({ articleId: article._id })
        res.json({
            status: 'ok',
            data: article
        })
    },
    getArticleTaskList: async (req, res) => {
        const article = await models.Article.findOne({ _id: ObjectId(req.params.id) })
        const tasks = await models.Task.find({ articleId: article._id })
        res.json({
            status: 'ok',
            data: tasks,
        })
    },
    addArticle: async (req, res) => {
        // 创建文章
        let article = new models.Article({
            title: req.body.title,
            content: req.body.content,
            platformIds: [],
            createTs: new Date(),
            updateTs: new Date(),
        })
        article = await article.save()
        res.json({
            status: 'ok',
            data: article,
        })
    },
    editArticle: async (req, res) => {
        let article = await models.Article.findOne({ _id: ObjectId(req.params.id) })
        if (!article) {
            return res.json({
                status: 'ok',
                error: 'not found'
            }, 404)
        }
        article.title = req.body.title
        article.content = req.body.content
        article.updateTs = new Date()
        article = await article.save()
        res.json({
            status: 'ok',
            data: article,
        })
    },
    deleteArticle: async (req, res) => {
        let article = await models.Article.findOne({ _id: ObjectId(req.params.id) })
        if (!article) {
            return res.json({
                status: 'ok',
                error: 'not found'
            }, 404)
        }
        await models.Article.remove({ _id: ObjectId(req.params.id) })
        res.json({
            status: 'ok',
            data: req.body,
        })
    },
    publishArticle: async (req, res) => {
        let article = await models.Article.findOne({ _id: ObjectId(req.params.id) })
        if (!article) {
            return res.json({
                status: 'ok',
                error: 'not found'
            }, 404)
        }
        const tasks = await models.Task.find({
            articleId: article._id,
            status: {
                $in: [
                    constants.status.NOT_STARTED,
                    constants.status.ERROR,
                ]
            },
            checked: true,
        })
        for (let task of tasks) {
            task.status = constants.status.NOT_STARTED
            task.ready = true
            task.updateTs = new Date()
            await task.save()
        }

        res.json({
            status: 'ok',
        })
    },
    addArticleTask: async (req, res) => {
        let task = new models.Task({
            articleId: ObjectId(req.params.id),
            platformId: ObjectId(req.body.platformId),
            status: constants.status.NOT_STARTED,
            createTs: new Date(),
            updateTs: new Date(),
            category: req.body.category,
            tag: req.body.tag,
        })
        task = await task.save()
        res.json({
            status: 'ok',
            data: task,
        })
    },
}

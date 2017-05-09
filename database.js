const Sequelize = require('sequelize')

const seq = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: 'webpack.docset/Contents/Resources/docSet.dsidx',
  logging: () => {
    /* quiet */
  },
})

const SearchIndex = seq.define(
  'searchIndex',
  {
    id: { type: Sequelize.INTEGER, primaryKey: true },
    name: { type: Sequelize.STRING },
    type: { type: Sequelize.STRING },
    path: { type: Sequelize.STRING },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
)

async function saveRecords(records) {
  await SearchIndex.sync({ force: true })
  await SearchIndex.bulkCreate(records)
}

module.exports = saveRecords

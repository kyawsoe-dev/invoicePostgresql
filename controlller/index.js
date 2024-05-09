exports.getIndexPage = async(req, res) => {
  res.render('index', {
    title: "WELCOME PAGE"
  })
}
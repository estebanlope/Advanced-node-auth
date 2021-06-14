exports.getPrivateData = (req, res, next) => {
  res.status(200).json({succes: true, data: "YOU GOT ACCES TO THE PRIVATE DATA IN THIS ROUTE"})
}
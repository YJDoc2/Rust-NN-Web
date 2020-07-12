exports.connectBack = (req, res) => {
  const { newArr, correctAns } = req.body;
  // const a=req.body;
  console.log("Input Array", newArr);
  console.log("Correct Result", correctAns);

  res.status(200).json({ ok: true });
};

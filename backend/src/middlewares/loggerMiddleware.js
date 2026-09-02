const logger = (req,res,next) =>{
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();
  console.log(`Protocol-> ${req.protocol} : URL-> ${req.url} : Time-> ${time} : Date-> ${date}`);

  next();
}

export default logger;
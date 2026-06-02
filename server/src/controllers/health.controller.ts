import { asyncHandler } from "../utils/asyncHandler"

const healthController = asyncHandler(async(_req,res) => {
        res.status(200).json({status:"ok"})
})

export default healthController
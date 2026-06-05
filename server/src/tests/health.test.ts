import request from "supertest"
import app from '../app'

describe('GET /health',function(){
    it('returns status ok', async ()=>{
        const response = await request(app).get('/health')
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({status:"ok",});
    })
})
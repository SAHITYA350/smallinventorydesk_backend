const jwtConfig = {
    secret: process.env.JWT_SECRET || 'secretkey123',
    expiresIn: '7d'
}

export default jwtConfig
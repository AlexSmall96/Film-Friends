import { server } from './mocks/server'
import { handlers } from './mocks/handlers'
import { afterEach, beforeAll, afterAll, beforeEach } from 'vitest';
import { cleanup  } from '@testing-library/react';

const setupTests = () => {
    beforeAll(() => {
        server.listen()
    })
    
    beforeEach(() => {
        server.resetHandlers(...handlers)
    })
    
    afterEach(() => {
        cleanup()
    })
      
    afterAll(() => {
        server.close()
    })
}

export default setupTests
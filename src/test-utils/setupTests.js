import { server } from './mocks/server'
import { afterEach, beforeAll, afterAll, beforeEach } from 'vitest';
import { cleanup  } from '@testing-library/react';
import { handlers } from './mocks/handlers';

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
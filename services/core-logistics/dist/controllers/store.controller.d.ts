import { Request, Response } from 'express';
import { StoreService } from '../services/store.service';
export declare class StoreController {
    private storeService;
    constructor(storeService: StoreService);
    getStoreInit: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    selectService: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getServiceContext: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=store.controller.d.ts.map
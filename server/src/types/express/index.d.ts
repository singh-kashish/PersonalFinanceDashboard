export {}; // Forces this file to become a module, TS won't treat it as script, global augmentation won't fail

declare global{ // Express types are global namespace declaration 
    namespace Express{ // Express types are global namespace declaration 
        interface Request{
            auth?:{
                userId:number;
                email:string;
            }
        }
    }
}

// Typescript Type Augmentation, not runtime JS. Extending existing Express's Request interface 
// because inside @types/Express Request interface is present
// That leads to reopening of that interface and merging of both interfaces(because of same name) which leads to Declaration Merging
// .d.ts-> No runtime JS generation, only type declations
// File disappears after compilation
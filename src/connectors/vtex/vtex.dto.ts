export class OrderVtexHook {
  Domain: string;
  OrderId: string;
  State: string;
  LastState: string;
  LastChange: Date;
  CurrentChange: Date;
  Origin: {
    Account: string;
    Key: string;
  };
}

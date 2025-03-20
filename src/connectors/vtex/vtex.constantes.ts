export class VtexConstantes {
  public static ACCOUNTNAME = 'mercantilnovaera';
  public static BASE_URL =
    'https://mercantilnovaeraloja10.vtexcommercestable.com.br/api/';
  public static API_ORDER_URL = `${VtexConstantes.BASE_URL}oms/pvt/orders/`;
  public static API_KEY = 'vtexappkey-mercantilnovaeraloja10-GUGDOD';
  public static TOKEN =
    'ZFUZVGSBWDVWACWGVZXMLFLPLMHENQTNJSSBSASWIXDCDMQGLVYIEPGCHQTCIJPDFWQZHWBSOVJUKWANKQFBGWOKIFOZBPYBMYPHFHETWSLQECAVTRREPMSVDKVIHLVR';
  public static SOURCE_ID_VTEX = 2;
  public static EVENT_ID_COMPRA = 6;
  public static EVENT_TYPE_COMPRA = 'Compra';
  public static SISTEM_USER = 1;
  public static CUSTOMER_UNIFIED = 1;
  public static STATUS_ID_CONCLUIDO = 17;
  public static BASE_URL_PRINCIPAL_VTEX =
    'https://mercantilnovaera.vtexcommercestable.com.br/api/';
  public static API_PRINCIPAL_ORDER_URL = `${VtexConstantes.BASE_URL_PRINCIPAL_VTEX}oms/pvt/orders/`;
  public static API_KEY_PRINCIPAL_VTEX = 'vtexappkey-mercantilnovaera-MNOHVC';
  public static TOKEN_PRINCIPAL_VTEX =
    'NDZPEZVOZMOSKLARVUZMEEDEUZSRDCPKJMXBOTBGZFHZDCYFRPEXUYHRSUPUEEMCMDCVDVUZUJQZUHDKKPCMRLXCINJXJTYSDSSAZJCCIRIISZPQQUWSNNZTARVHXWGZ';
  //EMAIL
  public static GET_EMAIL_CRM = `http://api.vtexcrm.com.br/${this.ACCOUNTNAME}/dataentities/CL/search?_fields=email,firstName,createdIn&_where=userId`;
}

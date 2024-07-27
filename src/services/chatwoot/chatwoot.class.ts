import { readFile } from "fs/promises";
import fetch from "node-fetch";
import FormData from "form-data";
import mime from "mime-types";

class ChatwootClass {
  config: { account?: string; token?: string; endpoint?: string };

  /**
   * Recibir todos los parametro de configuracio de conexion con chatwoot
   */
  constructor(
    _config: { account?: string; token?: string; endpoint?: string } = {}
  ) {
    if (!_config?.account) {
      throw new Error("ACCOUNT_ERROR");
    }

    if (!_config?.token) {
      throw new Error(`TOKEN_ERROR`);
    }

    if (!_config?.endpoint) {
      throw new Error(`ENDPOINT_ERROR`);
    }

    this.config = _config;
  }

  /**
   * [utility]
   * Formateo del formato del numero +34 34
   * @param {*} number
   * @returns
   */
  formatNumber = (number: any) => {
    if (!number.startsWith("+")) {
      return `+${number}`;
    }
    return number;
  };

  /**
   * [utility]
   * Esta funciona nos ayuda a crear un encabezado con la authorization del token
   * @returns
   */
  buildHeader = () => {
    const headers = new Headers();
    headers.append("api_access_token", this.config.token);
    headers.append("Content-Type", "application/json");
    return headers;
  };

  /**
   * [utility]
   * Esto nos ayuda a construir un url base
   * @param {*} path
   * @returns
   */
  buildBaseUrl = (path: string) => {
    return `${this.config.endpoint}/api/v1/accounts/${this.config.account}${path}`;
  };

  /**
   * [CONTACT]
   * https://www.chatwoot.com/developers/api/#tag/Contacts/operation/contactSearch
   * https://chatwoot-production-e265.up.railway.app/api/v1/accounts/1/contacts/search?q=+359987499
   * @param {*} from numero de telefono
   * @returns [] array
   */
  findContact = async (from) => {
    try {
      const url = this.buildBaseUrl(`/contacts/search?q=${from}`);

      const dataFetch = await fetch(url, {
        headers: this.buildHeader(),
        method: "GET",
      });

      const data = (await dataFetch.json()) as { payload: any[] };
      return data.payload[0];
    } catch (error) {
      console.error(`[Error searchByNumber]`, error);
      return [];
    }
  };

  /**
   * [CONTACT]
   *  Crear un contacto
   * @param {*} dataIn
   * @returns
   */
  createContact = async (dataIn = { from: "", name: "", inbox: "" }) => {
    try {
      dataIn.from = this.formatNumber(dataIn.from);

      const data = {
        inbox_id: dataIn.inbox,
        name: dataIn.name,
        phone_number: dataIn.from,
      };

      const url = this.buildBaseUrl(`/contacts`);

      const dataFetch = await fetch(url, {
        headers: this.buildHeader(),
        method: "POST",
        body: JSON.stringify(data),
      });

      const response = (await dataFetch.json()) as { payload: any };
      return response.payload.contact;
    } catch (error) {
      console.error(`[Error createContact]`, error);
      return;
    }
  };

  /**
   * [CONTACT]
   * Buscar o crear contacto
   * @param {*} dataIn
   * @returns
   */
  findOrCreateContact = async (dataIn = { from: "", name: "", inbox: "" }) => {
    try {
      dataIn.from = this.formatNumber(dataIn.from);
      const getContact = await this.findContact(dataIn.from);
      if (!getContact) {
        const contact = await this.createContact(dataIn);
        return contact;
      }
      return getContact;
    } catch (error) {
      console.error(`[Error findOrCreateContact]`, error);
      return;
    }
  };

  /**
   * [CONVERSATION]
   * Importante crear este atributo personalizado en el chatwoot
   * Crear conversacion
   * @param {*} dataIn
   * @returns
   */
  createConversation = async (dataIn: {
    inbox_id: string;
    contact_id: string;
    phone_number: string;
  }) => {
    try {
      const payload = {
        source_id: dataIn.phone_number,
        inbox_id: dataIn.inbox_id,
        contact_id: dataIn.contact_id,
        custom_attributes: {
          phone_number: dataIn.phone_number,
        },
      };

      const url = this.buildBaseUrl(`/conversations`);
      const response = await fetch(url, {
        method: "POST",
        headers: this.buildHeader(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[Error createConversation]`, error.message);
      return null;
    }
  };

  /**
   * [CONVERSATION]
   * Buscar si existe una conversacion previa
   * @param {*} dataIn
   * @returns
   */
  findConversation = async (dataIn: {
    phone_number: string;
    inbox_id: string;
  }) => {
    try {
      const payload = [
        {
          attribute_key: "phone_number",
          filter_operator: "equal_to",
          values: [dataIn.phone_number],
          query_operator: "AND",
        },
        {
          attribute_key: "inbox_id",
          filter_operator: "equal_to",
          values: [dataIn.inbox_id],
        },
      ];

      const url = this.buildBaseUrl(`/conversations/filter`);
      const response = await fetch(url, {
        method: "POST",
        headers: this.buildHeader(),
        body: JSON.stringify({ payload }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`
        );
      }

      const data = (await response.json()) as { payload: any[] };
      return data.payload;
    } catch (error) {
      console.error(`[Error findConversation]`, error.message);
      return null;
    }
  };

  /**
   * [CONVERSATION]
   * Buscar o Crear conversacion
   * @param {*} dataIn
   * @returns
   */
  findOrCreateConversation = async (dataIn: {
    inbox_id: string;
    contact_id: string;
    phone_number: string;
  }) => {
    try {
      dataIn.phone_number = this.formatNumber(dataIn.phone_number);

      const conversation = await this.findConversation(dataIn);
      if (!conversation.length) {
        console.log("Creating conversation");
        const newConversation = await this.createConversation(dataIn);
        return newConversation;
      }
      return conversation[0];
    } catch (error) {
      console.error(`[Error findOrCreateConversation]`, error.message);
      return null;
    }
  };
  /**
   * Esta funcion ha sido modificada para poder enviar archivos multimedia y texto
   * [messages]
   * @param {mode}  "incoming" | "outgoing"
   * @param {*} dataIn
   * @returns
   */

  public createMessage = async (
    dataIn = { msg: "", mode: "", conversation_id: "", attachment: [] }
  ): Promise<any> => {
    try {
      const url = this.buildBaseUrl(
        `/conversations/${dataIn.conversation_id}/messages`
      );
      const form = new FormData();

      form.append("content", dataIn.msg);
      form.append("message_type", dataIn.mode);
      form.append("private", "true");

      if (dataIn.attachment?.length) {
        const mimeType = mime.lookup(dataIn.attachment[0]) as string;
        const fileName = `${dataIn.attachment[0]}`.split("/").pop()!;
        const fileBuffer = await readFile(dataIn.attachment[0]);

        form.append("content", dataIn.msg || "");
        form.append("attachments[]", fileBuffer, {
          filename: fileName,
          contentType: mimeType,
        });
      }

      const dataFetch = await fetch(url, {
        method: "POST",
        headers: {
          api_access_token: this.config.token,
        },
        body: form,
      });

      const data = await dataFetch.json();
      return data;
    } catch (error) {
      console.error(`[Error createMessage]`, error);
      return;
    }
  };

  /**
   * [inboxes]
   * Crear un inbox si no existe
   * @param {*} dataIn
   * @returns
   */
  createInbox = async (dataIn = { name: "" }) => {
    try {
      const payload = {
        name: dataIn.name,
        channel: {
          type: "api",
          webhook_url: "",
        },
      };

      const url = this.buildBaseUrl(`/inboxes`);
      const dataFetch = await fetch(url, {
        headers: this.buildHeader(),
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await dataFetch.json();
      return data;
    } catch (error) {
      console.error(`[Error createInbox]`, error);
      return;
    }
  };

  /**
   * [inboxes]
   * Buscar si existe un inbox creado
   * @param {*} dataIn
   * @returns
   */
  findInbox = async (dataIn = { name: "" }) => {
    try {
      const url = this.buildBaseUrl(`/inboxes`);
      const dataFetch = await fetch(url, {
        headers: this.buildHeader(),
        method: "GET",
      });

      const data = (await dataFetch.json()) as { payload: any };
      const payload = data.payload;

      const checkIfExist = payload.find((o) => o.name === dataIn.name);

      if (!checkIfExist) {
        return;
      }

      return checkIfExist;
    } catch (error) {
      console.error(`[Error findInbox]`, error);
      return;
    }
  };

  /**
   * [inboxes]
   * Buscar o crear inbox
   * @param {*} dataIn
   * @returns
   */
  findOrCreateInbox = async (dataIn = { name: "" }) => {
    try {
      const getInbox = await this.findInbox(dataIn);
      if (!getInbox) {
        const idInbox = await this.createInbox(dataIn);
        return idInbox;
      }
      return getInbox;
    } catch (error) {
      console.error(`[Error findOrCreateInbox]`, error);
      return;
    }
  };
}

export { ChatwootClass };

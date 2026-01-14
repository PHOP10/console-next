"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Select, message, Button, Card } from "antd";
import { UserType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../services/user.service";

interface UserFormProps {
  fetchData: () => Promise<void>;
}

const UserForm: React.FC<UserFormProps> = ({ fetchData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);

  const handleAddUser = async () => {
    try {
      const values = await form.validateFields();
      await intraAuthService.createUser(values);
      message.success("เพิ่มผู้ใช้สำเร็จ");
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถเพิ่มผู้ใช้ได้");
    }
  };

  return (
    <>
      <Card
        bodyStyle={{ padding: 0 }}
        bordered={false}
        style={{ boxShadow: "none" }}
      >
        <div
          style={{
            fontSize: "20px",
            textAlign: "center",
            fontWeight: "bold",
            color: "#0683e9",
            borderBottom: "1px solid #e8e8e8",

            paddingTop: 14, 
            paddingBottom: 12,
            paddingLeft: 24,
            paddingRight: 24,

            marginBottom: "20px",
            height: "auto",
          }}
        >
          จัดการข้อมูลผู้ใช้
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",

            paddingLeft: 48, 
            paddingRight: 24,
            marginBottom: 16,
          }}
        >
          <Button
            type="primary"
            onClick={() => setIsModalOpen(true)}
            style={{ border: "none", boxShadow: "none", marginLeft: -24}}
          >
            เพิ่มผู้ใช้
          </Button>
        </div>

        <Modal>
          <Form form={form} layout="vertical"></Form>
        </Modal>
      </Card>
    </>
  );
};

export default UserForm;

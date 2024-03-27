import React, { useEffect, useState } from "react";
import {
  createHostedZoneAPI,
  deleteHostedZoneAPI,
  getDNSRecordsAPI,
  getHostedZonesAPI,
} from "../services/service";
import {
  Button,
  Checkbox,
  ConfigProvider,
  Divider,
  Dropdown,
  Input,
  Popover,
  Space,
  Table,
} from "antd";
import {
  CaretDownFilled,
  DeleteFilled,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import AddRecordModal from "./modals/addRecordModal";

export default function Home() {
  const [fake, setFake] = useState(1);

  const [hostedZones, setHostedZones] = useState([]);
  const [selectedHostedZone, setSelectedHostedZone] = useState({});

  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  const [domainName, setDomainName] = useState("");
  const [callerReference, setCallerReference] = useState("");
  const [comment, setComment] = useState("");
  const [warning, setWarning] = useState("");

  const [dNSRecords, setDNSRecords] = useState([]);
  const [selectedDNSRecords, setSelectedDNSRecords] = useState([]);

  const [recordName, setRecordName] = useState("");
  const [recordType, setRecordType] = useState("");
  const [recordTTL, setRecordTTL] = useState("300");
  const [recordValue, setRecordValue] = useState("");

  const [changes, setChanges] = useState("");
  const [comment2, setComment2] = useState("");

  const [scrollParams, updateScrollParams] = useState({
    y: window.innerHeight - 184.4,
    // x: window.innerWidth - 10,
  });

  function generateUUID() {
    const s4 = () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    return (
      s4() +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      s4() +
      s4()
    );
  }

  const populateHostedZones = async () => {
    try {
      const response = await getHostedZonesAPI();
      setSelectedHostedZone(response[0]); // default select first one
      setHostedZones(response); // populate options
      console.log("populateHostedZones successfull:", response);
    } catch (e) {
      console.log("populateHostedZones faliled:", e);
    }
  };

  const createHostedZone = async (dname, calref, comm) => {
    try {
      const payload = {
        domainName: dname,
        callerReference: calref,
        comment: comm,
      };
      const response = await createHostedZoneAPI(payload);
      populateHostedZones();
      console.log("createHostedZone successfull:", response);
    } catch (e) {
      console.log("createHostedZone faliled:", e);
    }
  };

  const deleteHostedZone = async (id) => {
    try {
      const payload = {
        hostedZoneId: id,
      };
      const response = await deleteHostedZoneAPI(payload);
      populateHostedZones();
      console.log("deleteHostedZone successfull:", response);
    } catch (e) {
      console.log("deleteHostedZone faliled:", e);
    }
  };

  const getDNSRecords = async (id) => {
    try {
      const payload = {
        hostedZoneId: id,
      };
      const response = await getDNSRecordsAPI(payload);
      setDNSRecords(response);
      console.log("getDNSRecords successfull:", response);
    } catch (e) {
      console.log("getDNSRecords faliled:", e);
    }
  };

  useEffect(() => {
    populateHostedZones();
  }, [fake]);

  useEffect(() => {
    if (selectedHostedZone.Id) getDNSRecords(selectedHostedZone.Id);
  }, [selectedHostedZone]);

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        flexDirection: "column",
        backgroundColor: "green",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "max-content",
          flexDirection: "row",
          display: "flex",
          gap: "10px",
        }}
      >
        <Dropdown
          menu={{
            items: hostedZones.map((item) => {
              return {
                label: item.Name,
                key: item.Id,
              };
            }),

            selectable: true,
            multiple: false,
            defaultSelectedKeys: [selectedHostedZone],

            onSelect: (e) => {
              const findByKey = hostedZones.find((obj) => obj.Id === e.key);
              setSelectedHostedZone(findByKey);
            },
          }}
          trigger={["click"]}
        >
          <Button
            icon={<CaretDownFilled />}
            style={{
              width: "300px",
              textAlign: "left",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {selectedHostedZone?.Name
              ? selectedHostedZone?.Name
              : "Select Hosted Zone"}
          </Button>
        </Dropdown>
        <Popover
          content={
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div>Domain Name (Required)</div>
                <Input
                  placeholder="example.com"
                  style={{ width: "300px" }}
                  value={domainName}
                  onChange={(e) => {
                    setDomainName(e.target.value);
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div>Caller Reference Id (Required)</div>
                <Input
                  disabled
                  style={{ width: "300px" }}
                  value={callerReference}
                  onChange={(e) => {
                    setCallerReference(e.target.value);
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div>Comments (Optional)</div>
                <Input
                  style={{ width: "300px" }}
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                  }}
                />
              </div>
              <div style={{ color: "red", fontSize: "12px" }}>{warning}</div>
              <div
                style={{ display: "flex", flexDirection: "row", gap: "10px" }}
              >
                <Button
                  onClick={() => {
                    if (domainName === "") {
                      setWarning("Domain Name required");
                    } else {
                      createHostedZone(domainName, callerReference, comment);
                      setOpen2(false);
                      setDomainName("");
                      setCallerReference("");
                      setComment("");
                      setWarning("");
                    }
                  }}
                  type="primary"
                >
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setOpen2(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          }
          title="Create a Hosted Zone"
          trigger="click"
          open={open2}
          onOpenChange={(e) => {
            const tempCRID = generateUUID();
            setCallerReference(tempCRID);
            setOpen2(e);
          }}
        >
          <Button icon={<PlusOutlined />}></Button>
        </Popover>
        <Popover
          content={
            <div>
              <div style={{ paddingBottom: "10px", fontWeight: "bold" }}>
                {selectedHostedZone?.Name}
              </div>
              <div
                style={{ display: "flex", flexDirection: "row", gap: "10px" }}
              >
                <Button
                  onClick={() => {
                    deleteHostedZone(selectedHostedZone.Id);
                    setOpen1(false);
                  }}
                  danger
                >
                  Delete
                </Button>
                <Button
                  onClick={() => {
                    setOpen1(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          }
          title="Confirm Delete"
          trigger="click"
          open={open1}
          onOpenChange={(e) => {
            setOpen1(e);
          }}
        >
          <Button icon={<DeleteFilled />} danger></Button>
        </Popover>
      </div>
      <div
        style={{
          width: "100%",
          flex: 1,
          backgroundColor: "red",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: "yellow",
            width: "40%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ width: "100%", height: "max-content" }}>infos</div>
          <div style={{ width: "100%", flex: 1, backgroundColor: "blue" }}>
            chart
          </div>
        </div>
        <div
          style={{
            height: "100%",
            backgroundColor: "yellowgreen",
            width: "60%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ width: "100%", height: "max-content" }}>
            <Button
              onClick={() => {
                console.log(selectedDNSRecords);
              }}
            >
              Print
            </Button>
            <Button
              onClick={() => {
                setOpen3(true);
              }}
              icon={<PlusOutlined />}
            ></Button>
            <AddRecordModal
              modalOpen={open3}
              setModalOpen={setOpen3}
              selectedHostedZone={selectedHostedZone}
              dNSRecords={dNSRecords}
              afterAdd={() => {
                getDNSRecords(selectedHostedZone.Id);
              }}
            />
          </div>
          <div style={{ width: "100%", flex: 1, backgroundColor: "orange" }}>
            {/* <EditOutlined /> */}
            <Table
              scroll={scrollParams}
              columns={[
                {
                  width: "40px",
                  key: "checkbox",
                  render: (_, record) => (
                    <ConfigProvider
                      theme={{
                        token: {
                          colorBorder: "#1677ff",
                        },
                      }}
                    >
                      <Checkbox
                        checked={selectedDNSRecords.some(
                          (objs) =>
                            objs.Name === record.Name &&
                            objs.Type === record.Type
                        )}
                        onClick={(e) => {
                          if (
                            selectedDNSRecords.some(
                              (objs) =>
                                objs.Name === record.Name &&
                                objs.Type === record.Type
                            )
                          ) {
                            setSelectedDNSRecords((cur) =>
                              cur.filter((item) => {
                                if (
                                  item.Name === record.Name &&
                                  item.Type === record.Type
                                ) {
                                } else {
                                  return item;
                                }
                              })
                            );
                          } else {
                            setSelectedDNSRecords((cur) => [...cur, record]);
                          }
                        }}
                      />
                    </ConfigProvider>
                  ),
                },
                {
                  width: "40px",
                  key: "checkbox",
                  render: (_, record) => (
                    <a>
                      <EditOutlined />
                    </a>
                  ),
                },
                {
                  title: "Name",
                  dataIndex: "Name",
                  key: "Name",
                  render: (_, record) => <div>{record?.Name}</div>,
                },
                {
                  title: "Type",
                  dataIndex: "Type",
                  key: "Type",
                  width: "80px",
                  render: (_, record) => <div>{record?.Type}</div>,
                },
                {
                  title: "Values",
                  dataIndex: "ResourceRecords",
                  key: "ResourceRecords",
                  render: (_, record) => (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {record?.ResourceRecords.map((item, ind) => {
                        return <div>{item?.Value}</div>;
                      })}
                    </div>
                  ),
                },
                {
                  title: "TTL",
                  dataIndex: "TTL",
                  key: "TTL",
                  render: (_, record) => <div>{record?.TTL}</div>,
                },
              ]}
              dataSource={dNSRecords}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

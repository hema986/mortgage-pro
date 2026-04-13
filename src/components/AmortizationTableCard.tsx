import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import type { AmortizationRow } from "../lib/mortgageMath";

const money = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type Props = {
  rows: AmortizationRow[];
  totalInterest: number;
  totalPrincipal: number;
};

export function AmortizationTableCard({ rows, totalInterest, totalPrincipal }: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  useEffect(() => {
    setPage(0);
  }, [rows.length]);

  if (rows.length === 0) {
    return null;
  }

  const slice = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
          Amortization schedule
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Principal &amp; interest only (taxes, insurance, HOA are not amortized).
        </Typography>
        <TableContainer sx={{ maxHeight: 280 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell align="right">Payment</TableCell>
                <TableCell align="right">Principal</TableCell>
                <TableCell align="right">Interest</TableCell>
                <TableCell align="right">Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {slice.map((r) => (
                <TableRow key={r.month} hover>
                  <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>{r.month}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {money.format(r.payment)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {money.format(r.principal)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {money.format(r.interest)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {money.format(r.balance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} sx={{ fontWeight: 600 }}>
                  Totals (loan life)
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {money.format(totalPrincipal)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {money.format(totalInterest)}
                </TableCell>
                <TableCell align="right">—</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          size="small"
          count={rows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[12, 24, 60, 120]}
          labelRowsPerPage="Rows"
        />
      </CardContent>
    </Card>
  );
}
